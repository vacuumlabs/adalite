import debugLog from '../helpers/debugLog'
import captureBySentry from '../helpers/captureBySentry'
import {Store, State} from '../state'

export default (store: Store) => {
  const {setState} = store

  return {
    setErrorState: (state: State, errorName: string, e: any, options?: any) => {
      if (e && e.name) {
        debugLog(e)
        captureBySentry(e)
        setState({
          [errorName]: {
            code: e.name,
            params: {
              message: e.message,
            },
          },
          error: e,
          ...options,
        })
      } else {
        setState({
          [errorName]: e,
          ...options,
        })
      }
    },
  }
}
