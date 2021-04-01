import {getErrorMessage} from '../errors'

function captureBySentry(e) {
  if (!getErrorMessage(e.name, {message: e.message})) {
    throw e
  }
  return
}

export default captureBySentry
