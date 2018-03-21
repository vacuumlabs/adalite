// TODO(TK) change this to [updater, message, payload] to new [updater, message, payload]
// middleware (state, prevState) => nextState

// clears loading and hello on url change
const sampleMid = (state, prevState) =>
  prevState.router.pathname !== state.router.pathname
    ? Object.assign({}, state, {loading: false, hello: undefined})
    : state

module.exports = sampleMid
