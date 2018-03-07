// middleware (prev, next) => nextState
{
  // clears loading and hello on url change
  const sampleMid = (prev, next) =>
    prev.router.pathname !== next.router.pathname
      ? {...next, loading: false, hello: undefined}
      : next

  const exported = {
    sampleMid,
  }

  window.e = window.e ? {...window.e, middleware: exported} : {middleware: exported}
}
