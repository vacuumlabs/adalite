export async function jsSleep(ms) {
  await new Promise(resolve => setTimeout(resolve, ms));
}

export function hasWebHID() {
  return !!navigator.hid;
}

class MessageQueue {
  constructor() {
    this.queue = [];
    this.resolvers = [];
  }

  addMessage(msg) {
    if (this.resolvers.length > 0) {
      const resolveFunc = this.resolvers.shift();
      resolveFunc(msg);
    } else {
      this.queue.push(msg);
    }
  }

  getNextMessage() {
    return new Promise((resolve) => {
      if (this.queue.length > 0) {
        const msg = this.queue.shift();
        resolve(msg);
      } else {
        this.resolvers.push(resolve);
      }
    });
  }
}

export async function getWebHIDDevice(vendorId, productId, onCloseCb) {
  let device;
  try {
    const devices = await navigator.hid.requestDevice({filters: [{vendorId, productId}]});
    const d = devices[0];
    // Filter out other products that might be in the list presented by the Browser.
    if (d.productName.includes('BitBox02')) {
      device = d;
    }
  } catch (err) {
    return null;
  }
  if (!device) {
    return null;
  }
  await device.open();

  // This is suboptimal API in WebHID - ideally we want to attach this event only when the above
  // device is disconnected. This way will likely break if multiple devices are connected at the
  // same time.
  navigator.hid.addEventListener('disconnect', event => {
    const disconnectedDevice = event.device;
    if (disconnectedDevice.vendorId === device.vendorId && disconnectedDevice.productId === device.productId) {
      if (onCloseCb) {
        onCloseCb();
        onCloseCb = undefined;
      }
    }
  });

  const msgQueue = new MessageQueue();


  const onInputReport = event => {
    msgQueue.addMessage(new Uint8Array(event.data.buffer));
  };
  device.addEventListener('inputreport', onInputReport);
  return {
    write: bytes => {
      if (!device.opened) {
        console.error('attempted write to a closed HID connection');
        return;
      }
      device.sendReport(0, bytes);
    },
    read: async () => {
      return await msgQueue.getNextMessage();
    },
    close: () => {
      device.close().then(() => {
        device.removeEventListener('inputreport', onInputReport);
        // The disconnect event above is not fired when closing the
        // device, so we manually invoke the callback.
        if (onCloseCb) {
          onCloseCb();
          onCloseCb = undefined;
      }
      });
    },
    valid: () => device.opened,
  };
}


async function getDevicePath() {
  const attempts = 10;
  for (let i = 0; i < attempts; i++){
    let response;
    let errorMessage;
    try {
      response = await fetch('http://localhost:8178/api/v1/devices', {
        method: 'GET',
        headers: {},
      })
      if (!response.ok && response.status === 403) {
        errorMessage = 'Origin not whitelisted.';
        throw new Error();
      } else if (!response.ok) {
        errorMessage = 'Unexpected bridge connection error.';
        throw new Error();
      }
    } catch(err) {
      throw new Error(errorMessage ? errorMessage : 'BitBoxBridge not found.');
    }
    const devices = (await response.json()).devices;
    if (devices.length !== 1) {
      await jsSleep(100);
      continue;
    }
    const devicePath = devices[0].path;
    return devicePath;
  }
  throw new Error('Expected exactly one BitBox02. If one is connected, it might already have an open connection another app. If so, please close the other app first.');
}

export async function getBridgeDevice(onCloseCb) {
  let devicePath = await getDevicePath();
  const socket = new WebSocket('ws://127.0.0.1:8178/api/v1/socket/' + devicePath);
  const msgQueue = new MessageQueue();

  return new Promise((resolve, reject) => {
    socket.binaryType = 'arraybuffer';
    socket.onmessage = event => { msgQueue.addMessage(new Uint8Array(event.data)); };
    socket.onclose = event => {
      if (onCloseCb) {
        onCloseCb();
        onCloseCb = undefined;
      }
    };
    socket.onopen = function (event) {
      resolve({
        write: bytes => {
          if (socket.readyState != WebSocket.OPEN) {
            console.error('attempted write to a closed socket');
            return;
          }
          socket.send(bytes);
        },
        read: async () => {
          return await msgQueue.getNextMessage();
        },
        close: () => socket.close(),
        valid: () => {
          return socket.readyState == WebSocket.OPEN;
        },
      });
    };
    socket.onerror = function(event) {
      reject(new Error('Your BitBox02 is busy.'));
    };
  });
}
