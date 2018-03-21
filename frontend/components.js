// 'react components' - just functions outputting html as interpolated strings
// component functions should expect prev and next state as the only arguments
// higher-order components should return component functions (or other HOCs)

const {
  execute,
  loadWalletFromMnemonic,
  generateMnemonic,
  reloadBalance,
  logout,
  toggleAboutOverlay,
  setCurrentTab,
  generateNewUnusedAddress,
  calculateFee,
  submitTransaction,
} = require('./actions')

const Unlock = (state) => `
<div class="box">
  <div class="label">Load wallet</div>
  <div>
      Mnemonic: <input type="text" id="mnemonic-submitted" name="mnemonic-submitted" size="47" value="${state.currentWalletMnemonicOrSecret}">
      <input type="submit" onclick="${execute(
    loadWalletFromMnemonic,
    "document.getElementById('mnemonic-submitted').value"
  )}" value="Load" />
      <div class="small">You can load a wallet even by submitting its root secret.</div>
  </div>
</div>`

const NewMnemonic = (state) => `
<div class="box">
    Generate new wallet mnemonic
    <input type="submit" onclick="${execute(generateMnemonic)}" value="Generate" />
    ${state.newWalletMnemonic ? `<div class="new-mnemonic">${state.newWalletMnemonic}</div>` : ''}
</div>
`

const Logout = (state) => `
  <div>
    <input class="logout" type="submit" onclick="${execute(logout)}" value="Close the wallet" />
  </div>
`

const Balance = (state) => `
  <div class="box"> Balance :
    <span>${isNaN(Number(state.balance)) ? state.balance : `${state.balance / 1000000} ADA`}</span>
    <input type="submit" onclick="${execute(reloadBalance)}" value="Reload" />
  </div>
`

const WalletHeader = (state) => `
    <div class="box wallet-header"">
        <div style="display: flex; flex-direction: row; justify-content:space-around; flex-wrap: wrap; align-items:baseline">
        <div class="wallet-name address">Wallet Id:
            ${state.activeWalletId ? state.activeWalletId : 'error, not initialized'}
        </div>
        ${Logout(state)}
        </div>
    </div>
`

const UsedAddressesList = (state) => `
  <div class="box address-list">
  <div class="label">Already used addresses:</div>
    ${state.usedAddresses.reduce((acc, elem) => `${acc}<span class="address">${elem}</span>`, '')}
  </div>
`

const UnusedAddressesList = (state) => {
  const disableGettingNewAddresses = state.unusedAddresses.length >= process.env.ADDRESS_RECOVERY_GAP_LENGTH

  return `
  <div class="box address-list">
    <div class="label">Receive to unused addresses:</div>
    ${state.unusedAddresses.reduce((acc, elem) => `${acc}<span class="address">${elem}</span>`, '')}
    <input class="box-btn" type="submit" ${disableGettingNewAddresses ? 'disabled="disabled"' : ''} onclick="${execute(() =>
  generateNewUnusedAddress(state.unusedAddresses.length)
)}" value="Get one more" />
  </div>
`
}

const TransactionHistory = (state) => `
  <div class="box address-list">
    <div class="label">Transaction History</div>
    <div>
      <div class="history-row">
        <div>Time</div>
        <div>Transaction</div>
        <div>Movement (ADA)</div>
      </div>
      ${state.transactionHistory.reduce((acc, transaction) => `${acc}
        <div class="history-row">
          <div>${new Date(transaction.ctbTimeIssued * 1000).toLocaleString()}</div>
          <div class="address">${transaction.ctbId}</div>
          <div>${(transaction.effect > 0 ? "+" : "") + (transaction.effect / 1000000)} </div>
        </div>
      `, '')}
    </div>
  </div>
`

const Fee = (state) => `
<div class="box">

      <button onclick="${execute(
    calculateFee,
    "document.getElementById('send-address').value",
    "parseInt(document.getElementById('send-amount').value)"
  )}">Calculate fee</button>
     <span style="${!state.fee && 'visibility: hidden'}">
      Fee: ${
  isNaN(Number(state.fee)) ? state.fee : `<span id="fee">${state.fee / 1000000}</span> ADA`
}
    </span>

</div>`

const SendAda = (state) => `
<div class="box">
    <div class="label">Send Ada</div>
    <div>To address: <input type="text" id="send-address" name="send-address" size="110" value="${state.sendAddress}" >
    </div>
    <div>
    amount: <input type="number" id="send-amount" name="send-amount" size="8" value="${state.sendAmount}"> ADA &nbsp;&nbsp;&nbsp;
    <span class="small">Transaction fees are not included in this amount!</span>
    </div>
    <button onclick="${execute(
      () => submitTransaction(
        document.getElementById('send-address').value,
        parseInt(document.getElementById('send-amount').value)
      )
    )}">Send Ada</button>
    ${state.sendSuccess !== '' ?
    `<span id="transacton-submitted">Transaction status: ${state.sendSuccess}</span>` : ''}
</div>
${Fee(state)}
`

const WalletInfo = (state) => `
  ${WalletHeader(state)}
  ${Balance(state)}
  ${UnusedAddressesList(state)}
  ${UsedAddressesList(state)}
  ${TransactionHistory(state)}
`

const SendAdaScreen = (state) => `
  ${WalletHeader(state)}
  ${Balance(state)}
  ${SendAda(state)}
`

const Index = (state) => {
  switch (state.currentTab) {
    case 'new-wallet':
      return NewMnemonic(state)
    case 'wallet-info':
      return state.activeWalletId ? WalletInfo(state) : Unlock(state)
    case 'send-ada':
      return state.activeWalletId ? SendAdaScreen(state) : Unlock(state)
    default:
      return 'CardanoLite  wallet'
  }
}

const Navbar = (state) => `
  <div class="navbar">
    <div class="title">
      CardanoLite Wallet
    </div>
    <a class="${state.currentTab === 'new-wallet' && 'active'}" href="#"
     onclick="${execute(() => setCurrentTab('new-wallet'))}">New Wallet</a>
    <a class="${state.currentTab === 'wallet-info' && 'active'}" href="#"
     onclick="${execute(() => setCurrentTab('wallet-info'))}">View Wallet Info</a>
    <a class="${state.currentTab === 'send-ada' && 'active'}" href="#"
     onclick="${execute(() => setCurrentTab('send-ada'))}">Send Ada</a>
    <a href="#" onclick="${execute(toggleAboutOverlay)}">About</a>
  </div>
`

const AboutOverlay = (state) =>
  state.displayAboutOverlay ? `
    <div class="about-overlay" onclick=${execute(toggleAboutOverlay)}>
      <div class="text">
        <div>
          CardanoWallet lite is not a bank. It does not really store your funds permanently - each
          time you interact with it, you have to insert the mnemonic - the 12-words long root password
          to your account. If you lose this, we cannot help you restore the funds.
        </div>
        <div>
          The project is in alpha version and should be used for penny-transactions only.
        </div>
        <div>
          Feedback is welcomed.
        </div>
      </div>
    </div>
  ` : ''


const TopLevelRouter = (state, prevState) => {
  const {pathname} = window.location
  const topLevelRoute = pathname.split('/')[1]
  let body = ''
  switch (topLevelRoute) {
    case '':
      body = Index(state, prevState)
      break
    default:
      body = Index(state, prevState)
    // body = '404 - not found'
  }
  return `
  ${AboutOverlay(state, prevState)}
  ${Navbar(state, prevState)}
  <div class="Aligner">
    <div
      class="Aligner-item"
    >
    ${body}
    </div>
  </div>
  `
}

module.exports = TopLevelRouter
