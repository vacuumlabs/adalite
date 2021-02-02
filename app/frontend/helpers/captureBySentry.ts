import {getTranslation} from '../translations'

function captureBySentry(e) {
  if (!getTranslation(e.name, {message: e.message})) {
    throw e
  }
  return
}

export default captureBySentry
