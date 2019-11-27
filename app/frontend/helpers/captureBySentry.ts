import {getTranslation} from '../translations'

function captureBySentry(e) {
  if (!getTranslation(e.name)) {
    throw e
  }
  return
}

export default captureBySentry
