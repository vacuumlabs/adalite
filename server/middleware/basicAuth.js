const basicAuth = require('express-basic-auth')

module.exports = (routes, users) => (req, res, next) => {
  routes.indexOf(req.path) > -1
    ? basicAuth({
      users,
      challenge: true,
    })(req, res, next)
    : next()
}
