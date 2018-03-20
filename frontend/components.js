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
} = require('./actions')

const Unlock = (state) => `
<div class="box">
  <div>Load wallet</div>
  <div>
      Mnemonic: <input type="text" id="mnemonic-submitted" name="mnemonic-submitted" size="47" value="${state.currentWalletMnemonicOrSecret}">
      <input type="submit" onclick="${execute(loadWalletFromMnemonic, "document.getElementById('mnemonic-submitted').value")}" value="Load" />
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
    <span>${state.balance / 1000000} ADA</span>
    <input type="submit" onclick="${execute(reloadBalance)}" value="Reload" />  
  </div>   
`

const WalletHeader = (state) => `
    <div class="wallet-header box"">
        <div style="display: flex; flex-direction: row; justify-content:space-around; flex-wrap: wrap; align-items:baseline">
        <div class="wallet-name" style="width: 350px; overflow: hidden; text-overflow: ellipsis;white-space: nowrap;">Wallet:  
            ${state.rootSecret ? state.rootSecret : 'error, not initialized'}
        </div>
        ${Logout(state)}
        </div>
    </div>
`


const UsedAddressesList = (state) => `
  <div class="box address-list"> Already used addresses: <br/>
    ${state.usedAddresses.reduce((acc, elem) => (`${acc}<span class="address">${elem}</span>`), '')}
  </div>   
`


const UnusedAddressesList = (state) => `
  <div class="box address-list"> Unused addresses: <br/>
    ${state.unusedAddresses.reduce((acc, elem) => (`${acc}<span class="address">${elem}</span>`), '')}
    <input class="box-btn" type="submit" onclick="${execute(() => generateNewUnusedAddress(state.unusedAddresses.length))}" value="Get one more" /> 
  </div>  
`


const WalletInfo = (state) => `
  ${WalletHeader(state)}
  ${Balance(state)}
  ${UsedAddressesList(state)}
  ${UnusedAddressesList(state)}
`

const SendAdaScreen = (state) => `
  TODO
`

const Index = (state) => {
  switch(state.currentTab) {
    case 'new-wallet':
        return NewMnemonic(state)
    case 'wallet-info':
        return state.rootSecret ? WalletInfo(state) : Unlock(state)
    case 'send-ada':
        return state.rootSecret ? SendAdaScreen(state) : Unlock(state)
    default:
        return
  } 
}


const Navbar = (state) => `
  <div class="navbar">
    <div class="title">
      CardanoLite Wallet
    </div>
    <a class="${state.currentTab === 'new-wallet' && 'active'}" href="#" onclick="${execute(() => setCurrentTab('new-wallet'))}">New Wallet</a>
    <a class="${state.currentTab === 'wallet-info' && 'active'}" href="#" onclick="${execute(() => setCurrentTab('wallet-info'))}">View Wallet Info</a>
    <a class="${state.currentTab === 'send-ada' && 'active'}" href="#" onclick="${execute(() => setCurrentTab('send-ada'))}">Send Ada</a>
    <a href="#" onclick="${execute(toggleAboutOverlay)}">About</a>
  </div>
`

const AboutOverlay = (state) =>
  state.displayAboutOverlay ? `
    <div class="about-overlay" onclick=${execute(toggleAboutOverlay)}>
      <div class="text">Insert text here</div>
    </div>
  ` : ``


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
      class="AlignerItem"
    >
    ${body}
    </div>
  </div>
  `
}

module.exports = TopLevelRouter
