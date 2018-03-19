// 'react components' - just functions outputting html as interpolated strings
// component functions should expect prev and next state as the only arguments
// higher-order components should return component functions (or other HOCs)

const {execute, hello, delayedHello, addTodo, setInputValue, submitMenmonic, generateMenmonic, reloadBalance, logout} = require('./actions')

const Unlock = (state) => `
  <div>
  Load a wallet
  </div>

<p>
    Mnemonic: <input type="text" id="mnemonic-submitted" name="mnemonic-submitted" size="47" value="A859BCAD5DE4FD8DF3F3BFA24793DBA52785F9A98832300844F028FF2DD75A5FCD24F7E51D3A2A72AC85CC163759B1103EFB1D685308DCC6CD2CCE09F70C948501E949B5B7A72F1AD304F47D842733B3481F2F096CA7DDFE8E1B7C20A1ACAFBB66EE772671D4FEF6418F670E80AD44D1747A89D75A4AD386452AB5DC1ACC32B3">
    <input type="submit" onclick="${execute(submitMenmonic, "document.getElementById('mnemonic-submitted').value")}" value="Load the wallet" />
    <p>You can alternatively submit wallet's root secret.</p>
</p>`

const NewMnemonic = (state) => `<p>
    Genetare a new mnemonic.
    <input type="submit" onclick="${execute(generateMenmonic)}" value="Generate mnemonic" />    
    <div id="mnemonic-generated">${state.newMnemonic ? state.newMnemonic : ''}</div>
</p>
`

const Logout = (state) => `
  <div>  
    <input type="submit" onclick="${execute(logout)}" value="Close the wallet" />
  </div>   
`

const Balance = (state) => `
  <div> Balance : 
    <span>${state.balance ? `${state.balance}Lovelace` : 'unavailable'}</span>
    <input type="submit" onclick="${execute(reloadBalance)}" value="Reload" />  
    <p>1 Lovelace = 1/1,000,000 Ada</p>
  </div>   
`


const Wallet = (state) => `
  <div> Wallet:  
    <span style="width: 50%; overflow: hidden; text-overflow: ellipsis;"> 
        ${state.rootSecret ? state.rootSecret : 'error, not initialized'}
    </span>
  </div>
  ${Balance(state)}
  ${Logout(state)}
`


// const Hello = (isAsync) => (state) => `${
//   state.loading
//     ? 'Loading...'
//     : state.hello
//       ? `Hello ${state.hello}`
//       : `
//         <button
//           class="AlignerItem"
//           onclick="${isAsync ? execute(delayedHello) : execute(hello)}"
//         >
//           Load 'Hello world'
//         </button>
//         `
// }
//     </div>
//   </div>
// `
// const TodoList = (state) => `
//   <div>
//     ${state.todos.join('<br/>')}
//   </div>
//   <input type="text" id="todo" />
//   <input type="submit" onclick="${execute(addTodo, "document.getElementById('todo').value")}" value="Submit" />
// `
//
// const ControlledInput = (state) => `
//   <input type="text" value="${state.controlledInputValue}" oninput="${execute(setInputValue)}">
// `


const Index = (state) => {
  // const example = `a onclick="window.history.pushState({}, 'Sync Hello', 'hello')">Hello World!</a`
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
    // case 'hello':
    //   body = Hello(false)(state, prevState)
    //   break
    // case 'asynchello':
    //   body = Hello(true)(state, prevState)
    //   break
    // case 'todo':
    //   body = TodoList(state, prevState)
    //   break
    // case 'controlled':
    //   body = ControlledInput(state, prevState)
    //   break
    default:
      body = '404 - not found'
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
