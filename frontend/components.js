// 'react components' - just functions outputting html as interpolated strings
// component functions should expect prev and next state as the only arguments
// higher-order components should return component functions (or other HOCs)

const {execute, hello, delayedHello, addTodo} = require('./actions')

const Index = (prev, next) => {
  return `
  <a onclick="window.history.pushState({}, 'Sync Hello', 'hello')">Hello World!</a>
  <a onclick="window.history.pushState({}, 'Async Hello', 'asynchello')">Async Hello World!</a>
  <a onclick="window.history.pushState({}, 'TODO List', 'todo')">TODO List</a>
  <a onclick="window.history.pushState({}, 'Controlled Input', 'controlled')">Controlled Input</a>
`
}

const HOCHello = (isAsync) => (prev, state) => `${
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
const TODOList = (prev, state) => `
  <div>
    ${state.todos.join('<br/>')}
  </div>
  <input type="text" id="todo" />
  <input type="submit" onclick="${execute(addTodo, "document.getElementById('todo').value")}" value="Submit" />
`

const ControlledInput = (prev, state) => `
  <input type="text" value=
"${state.controlledInputValue}" oninput="window.e.actions.setInputValue(this)">
`

const TopLevelRouter = (prev, next) => {
  const {pathname} = window.location
  const topLevelRoute = pathname.split('/')[1]
  let body = ''
  switch (topLevelRoute) {
    case '':
      body = Index(prev, next)
      break
    case 'hello':
      body = HOCHello(false)(prev, next)
      break
    case 'asynchello':
      body = HOCHello(true)(prev, next)
      break
    case 'todo':
      body = TODOList(prev, next)
      break
    case 'controlled':
      body = ControlledInput(prev, next)
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
