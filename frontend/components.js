// 'react components' - just functions outputting html as interpolated strings
// component functions should expect prev and next state as the only arguments
// higher-order components should return component functions (or other HOCs)

const {execute, hello, delayedHello, addTodo, setInputValue} = require('./actions')

const Index = (state) => {
  return `
  <a onclick="window.history.pushState({}, 'Sync Hello', 'hello')">Hello World!</a>
  <a onclick="window.history.pushState({}, 'Async Hello', 'asynchello')">Async Hello World!</a>
  <a onclick="window.history.pushState({}, 'TODO List', 'todo')">TODO List</a>
  <a onclick="window.history.pushState({}, 'Controlled Input', 'controlled')">Controlled Input</a>
`
}

const HOCHello = (isAsync) => (state) => `${
  state.loading
    ? 'Loading...'
    : state.hello
      ? `Hello ${state.hello}`
      : `
        <button
          class="AlignerItem"
          onclick="${isAsync ? execute(delayedHello) : execute(hello)}"
        >
          Load 'Hello world'
        </button>
        `
}
    </div>
  </div>
`
const TODOList = (state) => `
  <div>
    ${state.todos.join('<br/>')}
  </div>
  <input type="text" id="todo" />
  <input type="submit" onclick="${execute(addTodo, "document.getElementById('todo').value")}" value="Submit" />
`

const ControlledInput = (state) => `
  <input type="text" value="${state.controlledInputValue}" oninput="${execute(setInputValue)}">
`

const TopLevelRouter = (state, prevState) => {
  const {pathname} = window.location
  const topLevelRoute = pathname.split('/')[1]
  let body = ''
  switch (topLevelRoute) {
    case '':
      body = Index(state, prevState)
      break
    case 'hello':
      body = HOCHello(false)(state, prevState)
      break
    case 'asynchello':
      body = HOCHello(true)(state, prevState)
      break
    case 'todo':
      body = TODOList(state, prevState)
      break
    case 'controlled':
      body = ControlledInput(state, prevState)
      break
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
