// 'react components' - just functions outputting html as interpolated strings
// component functions should expect prev and next state as the only arguments
// higher-order components should return component functions (or other HOCs)

const {execute, submitMnemonic, generateMenmonic, reloadBalance, getRecieveAddress, logout} = require('./actions')

const Unlock = (state) => `
<div class="box">
  <div>Load a wallet</div>
  <div>
      Mnemonic: <input type="text" id="mnemonic-submitted" name="mnemonic-submitted" size="47" value="A859BCAD5DE4FD8DF3F3BFA24793DBA52785F9A98832300844F028FF2DD75A5FCD24F7E51D3A2A72AC85CC163759B1103EFB1D685308DCC6CD2CCE09F70C948501E949B5B7A72F1AD304F47D842733B3481F2F096CA7DDFE8E1B7C20A1ACAFBB66EE772671D4FEF6418F670E80AD44D1747A89D75A4AD386452AB5DC1ACC32B3">
      <input type="submit" onclick="${execute(submitMnemonic, "document.getElementById('mnemonic-submitted').value")}" value="Load the wallet" />
      <div>You can alternatively submit wallet's root secret.</div>
  </div>
</div>`

const NewMnemonic = (state) => `
<div class="box">
    Genetare a new mnemonic.
    <input type="submit" onclick="${execute(generateMenmonic)}" value="Generate mnemonic" />    
    <div id="mnemonic-generated">${state.newMnemonic ? state.newMnemonic : ''}</div>
</div>
`

const Logout = (state) => `
  <div>  
    <input class="logout" type="submit" onclick="${execute(logout)}" value="Close the wallet" />
  </div>   
`

const Balance = (state) => `
  <div class="box"> Balance : 
    <span>${state.balance} Lovelace</span>
    <input type="submit" onclick="${execute(reloadBalance)}" value="Reload" />  
    <div style="font-size: smaller">1 Lovelace = 1/1,000,000 Ada</div>
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

const RecieveAddress = (state) => `
  <div class="box"> Address for recieving : 
    <span class="address">${state.recieve}</span>
    <input type="submit" onclick="${execute(getRecieveAddress)}" value="Check unused " />  
  </div>   
`


const Wallet = (state) => `
  ${WalletHeader(state)}
  ${Balance(state)}
  ${RecieveAddress(state)}
`

const Index = (state) => {
  return state.rootSecret ? Wallet(state) : Unlock(state) + NewMnemonic(state)
}


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
