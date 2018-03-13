// middleware (state, prevState) => nextState

// clears loading and hello on url change
const sampleMid = (state, prevState) =>
  prevState.router.pathname !== state.router.pathname
    ? {...state, loading: false, hello: undefined}
    : state

module.exports = sampleMid
