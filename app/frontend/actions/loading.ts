import {Store, State} from '../state'

export default ({setState}: Store) => {
  const loadingAction = (state: State, message: string) => {
    return setState({
      loading: true,
      loadingMessage: message,
    })
  }

  const stopLoadingAction = (state: State) => {
    return setState({
      loading: false,
      loadingMessage: undefined,
    })
  }

  return {
    loadingAction,
    stopLoadingAction,
  }
}
