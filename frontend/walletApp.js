// init the application
const TopLevelRouter = require('./components')
const sampleMid = require('./middleware')
const {init} = require('./simpleRedux')


init(
  {
    loading: false,
    controlledInputValue: ''},
  [sampleMid],
  TopLevelRouter,
  document.getElementById('root')
)
