import {Store, State} from '../state'

export default (store: Store) => {
  const {setState} = store

  return {
    loadingAction: (state: State, message: string) => {
      setState({
        loading: true,
        loadingMessage: message,
      })
    },
    stopLoadingAction: (state: State) => {
      setState({
        loading: false,
        loadingMessage: undefined,
      })
    },
  }
}
