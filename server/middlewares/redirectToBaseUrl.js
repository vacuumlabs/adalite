const {backendConfig} = require('../helpers/loadConfig')

module.exports = (req, res, next) => {
  if (`${req.protocol}://${req.get('host')}` !== backendConfig.ADALITE_SERVER_URL) {
    res.redirect(301, `${backendConfig.ADALITE_SERVER_URL}${req.originalUrl}`)
  } else {
    next()
  }
}
