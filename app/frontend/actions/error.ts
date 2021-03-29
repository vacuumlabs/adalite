import debugLog from '../helpers/debugLog'
import captureBySentry from '../helpers/captureBySentry'
import {Store, State} from '../state'

export default ({setState}: Store) => {
  const setError = (state: State, {errorName, error}: {errorName: string; error: any}) => {
    if (error && error.name) {
      debugLog(error)
      captureBySentry(error)
      setState({
        [errorName]: {
          code: error.name,
          params: {
            message: error.message,
          },
        },
        error,
      })
    } else {
      setState({
        [errorName]: error,
      })
    }
  }

  return {
    setError,
  }
}
