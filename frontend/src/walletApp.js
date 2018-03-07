// init the application
{
  const {TopLevelRouter} = window.e.components
  const {sampleMid} = window.e.middleware
  const {init} = window.e.redux

  init(
    {
      hello: undefined,
      loading: false,
      todos: [],
      controlledInputValue: '',
    },
    [sampleMid],
    TopLevelRouter,
    'root'
  )
}
