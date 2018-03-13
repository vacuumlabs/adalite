// init the application
const TopLevelRouter = require('./components')
const sampleMid = require('./middleware')
const {init} = require('./simpleRedux')

init(
  {
    hello: undefined,
    loading: false,
    todos: [],
    controlledInputValue: ''},
  [sampleMid],
  TopLevelRouter,
  'root'
)
