# BitBox02 TypeScript/WASM library

A library to interact with the BitBox02 hardware wallet.

Check out the [sandbox project](./sandbox) that shows how to use this library.

Example:

```typescript
import * as bitbox from 'bitbox-api';

// Run this in e.g. a button onClick event handler.
async function example() {
  try {
    const onClose = () => {
      // Handle disconnect.
    };
    const unpaired = await bitbox.bitbox02ConnectAuto(onClose);
    const pairing = await unpaired.unlockAndPair();
    const pairingCode = pairing.getPairingCode();
    if (pairingCode !== undefined) {
      // Display pairingCode to user
    }
    const bb02 = await pairing.waitConfirm();
    console.log('Product', bb02.product());
    console.log('Supports Ethereum functionality (Multi edition)?', bb02.ethSupported());
    const deviceInfos = await bb02.deviceInfo();
    console.log('Device infos:', deviceInfos);
  } catch (err) {
    const typedErr = bitbox.ensureError(err);
    console.log(typedErr);
  }
}
```

The package's `bitbox_api.d.ts` file contain a documentation of all types and functions.

## WebPack

In WebPack projects, enable the `asyncWebAssembly` and `topLeveLAwait` features in your
`webpack.config.js` (see https://webpack.js.org/configuration/experiments/):

```
module.exports = {
  //...
  experiments: {
    asyncWebAssembly: true,
    topLevelAwait: true,
  },
};
```

## Vite:

Here is a sample `vite.config.ts`:

```
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), wasm(), topLevelAwait()],
})
```

You need to install the wasm and topLevelAwait plugins to add them to the project.
