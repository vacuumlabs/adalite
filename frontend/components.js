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
  <h2 class="label">Load Wallet</h2>
  <label>
    <span>Mnemonic</span>
    <input type="text" id="mnemonic-submitted" class="address" name="mnemonic-submitted" size="47" value="${state.currentWalletMnemonicOrSecret}">
  </label>
  <button onclick="${execute(loadWalletFromMnemonic, "document.getElementById('mnemonic-submitted').value")}">Load wallet</button>
</div>`

const NewMnemonic = (state) => `
<div class="box">
    <h2>New Wallet Mnemonic</h2>
    <input type="text" class="address" placeholder="Press 'Generate' to create new mnenomonic"  value="${state.newWalletMnemonic}" />
    <button onclick="${execute(generateMnemonic)}">Generate</button>
</div>
`

const Balance = (state) => `
  <h3>Balance</h3>
  <p>${isNaN(Number(state.balance)) ? state.balance : `${state.balance / 1000000} ADA`}</p>
`

const WalletHeader = (state) => `
  <div class="box box-info">
    <h2>Wallet</h2>
    <h3>Active Wallet ID</h3>
    <input readonly class="address" value="${state.activeWalletId ? state.activeWalletId : 'error, not initialized'}" />
    ${Balance(state)}
    <p>
      <button onclick="${execute(reloadBalance)}">Reload Balance</button>
      <button class="danger" onclick="${execute(logout)}">Close the wallet</button>
    </p>
  </div>
`

const UsedAddressesList = (state) => `
  <div class="box">
    <h2>Already Used Addresses</h2>
    ${state.usedAddresses.reduce((acc, elem) => `${acc}<input readonly type="text" class="address" value="${elem}/>`, '')}
  </div>
`

const UnusedAddressesList = (state) => {
  const disableGettingNewAddresses =
    state.unusedAddresses.length >= process.env.CARDANOLITE_ADDRESS_RECOVERY_GAP_LENGTH

  return `
  <div class="box">
    <h2>Unused Addresses</h2>
    ${state.unusedAddresses.reduce((acc, elem) => `${acc}<input readonly type="text" class="address" value="${elem}"/>`, '')}
    <button ${disableGettingNewAddresses ? 'disabled="disabled"' : ''} onclick="${execute(() =>
  generateNewUnusedAddress(state.unusedAddresses.length)
)}">Get one more</button>
  </div>
`
}

const TransactionHistory = (state) => `
  <div class="box">
    <h2>Transaction History</h2>
    <table>
      <thead>
        <tr>
        <th>Time</th>
        <th>Transaction</th>
        <th>Movement (ADA)</th>
        </tr>
      </thead>
      <tbody>
        ${state.transactionHistory.reduce((acc, transaction) => `${acc}
          <tr>
            <td>${new Date(transaction.ctbTimeIssued * 1000).toLocaleString()}</td>
            <td><input type="text" readonly class="address" value="${transaction.ctbId}"/></td>
            <td><pre>${transaction.effect > 0 ? '+' : ''}${transaction.effect / 1000000}</pre></td>
          </tr>
        `, '')}
      </tbody>
    </table>
  </div>
`

const Fee = (state) => `
  <button onclick="${execute(
    calculateFee,
    "document.getElementById('send-address').value",
    "parseInt(document.getElementById('send-amount').value, 10) * 1000000"
  )}">Calculate Fee</button>
    <div style="${!state.fee && 'display: none'}">
      <h3>Fee</h3>
      ${isNaN(Number(state.fee)) ? state.fee : `<span id="fee">${state.fee / 1000000}</span> ADA`}
    </div>
</span>`

const SendAda = (state) => `
<div class="box">
<h2>Send Ada</h2>
  ${state.sendSuccess !== '' ? `<span id="transacton-submitted">Transaction status: ${state.sendSuccess}</span>` : ''}
  <label><span>Address</span> <input type="text" id="send-address" class="address" name="send-address" size="110" value="${state.sendAddress}" >
  </label>
  <label>
    <span>Amount</span> <input type="number" id="send-amount" name="send-amount" size="8" step="0.5" value="${state.sendAmount / 1000000}"> ADA
  </label>
  <small> The amount does not include the transaction fee! </small>
  <p>
  <button onclick="${execute(
    submitTransaction,
    "document.getElementById('send-address').value",
    "parseInt(document.getElementById('send-amount').value)"
  )}">Send Ada</button>
  ${Fee(state)}
  </p>
</div>
`

const WalletInfo = (state) => `
  ${WalletHeader(state)}
  ${UnusedAddressesList(state)}
  ${UsedAddressesList(state)}
  ${TransactionHistory(state)}
`

const SendAdaScreen = (state) => `
  ${WalletHeader(state)}
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
    <div class="navbar-wrap">
      <a class="title" href="/"><img src="/assets/logo.png" />
      CardanoLite Wallet<sup>⍺</sup>
      </a>
      <nav>
        <a class="${state.currentTab === 'new-wallet' && 'active'}" href="#" onclick="${execute(() => setCurrentTab('new-wallet'))}">
          New Wallet
        </a>
        <a class="${state.currentTab === 'wallet-info' && 'active'}" href="#" onclick="${execute(() => setCurrentTab('wallet-info'))}">
          Wallet Info
        </a>
        <a class="${state.currentTab === 'send-ada' && 'active'}" href="#" onclick="${execute(() => setCurrentTab('send-ada'))}">
          Send Ada
        </a>
        <a href="https://github.com/vacuumlabs/cardano" target="_blank">
          About
        </a>
      </nav>
    </div>
  </div>
`

const AboutOverlay = (state) =>
  state.displayAboutOverlay ? `
    <div class="overlay about-overlay" onclick=${execute(toggleAboutOverlay)}>
      <div class="box text">
        <h2> Disclaimer: CardanoLite is not created by Cardano Foundation. </h2>
        <p> The official Cardano team did not review this code and is not responsible for any damage
          it may cause you. The CardanoLite project is in alpha stage and should be used for
          penny-transactions only. We appreciate feedback, especially review of the crypto-related code.
        </p>
        <h2> CardanoLite is not a bank </h2>
        <p>
          It does not really store your funds permanently - each
          time you interact with it, you have to insert the mnemonic - the 12-words long root password
          to your account. If you lose it, we cannot help you restore the funds.
        </p>
        <p>
          Feedback and contributions are very welcomed.
        </p>
      </div>
    </div>
  ` : ''

const Loading = (state) =>
  state.loading ? `
    <div class="overlay">
      <div class="donut"></div>
    </div>
  ` : ''

const Footer = (state) => `
  <footer class="footer">
    <p>
      Powered with 🚀 tech in
      <a href="https://vacuumlabs.com" target="_blank">
        <img src="/assets/vacuumlabs-logo-dark.svg" class="logo" alt="Vacuumlabs Logo" />
      </a>
    </p>
    <p>
      <small><a href="https://github.com/vacuumlabs/cardano" target="_blank">View on Github</a></small>
    </p>
  </footer>
`

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
  <div class="wrap">
    ${AboutOverlay(state, prevState)}
    ${Loading(state)}
    ${Navbar(state, prevState)}
    <main class="main">
      ${body}
    </main>
    ${Footer(state)}
  </div>
  `
}

module.exports = TopLevelRouter
