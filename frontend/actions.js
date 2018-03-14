// actions are just functions which also call update
const {dispatch} = require('./simpleRedux.js')

let counter = 0

const executeKey = '__cardano__global_fns'
window[executeKey] = {}

const fnNames = new Map()
// first arg is function to be called, rest of the arguments are to be passed inside fn.
function execute(fn, ...stringArgs) {
  if (fnNames.get(fn) == null) {
    const name = `function_number_${counter++}`
    fnNames.set(fn, name)
    window[executeKey][name] = fn
  }
  const name = fnNames.get(fn)
  const argStr = stringArgs.join(', ')
  return `window['${executeKey}']['${name}'](${argStr})`
}

const hello = () => {
  dispatch((state) => ({...state, hello: 'World'}), 'Say Hello')
}

const delayedHello = () => {
  dispatch((state) => ({...state, loading: true}), 'set loading')
  setTimeout(() => {
    dispatch((state) => ({...state, loading: false, hello: 'Internet'}), 'Say... Hello')
  }, 1000)
}

const addTodo = (todo) => {
  // this is how you can get the event object
  // this is just demo, it's not necessary to call this now.
  console.log(window.event) // eslint-disable-line no-console
  dispatch((state) => ({...state, todos: state.todos.concat(todo)}), 'add todo')
}

const setInputValue = () => {
  dispatch((state) => ({...state, controlledInputValue: window.event.target.value}), 'set input value')
}

module.exports = {
  delayedHello,
  hello,
  addTodo,
  setInputValue,
  execute,
}
