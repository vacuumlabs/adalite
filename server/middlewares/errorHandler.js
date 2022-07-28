const IpDeniedError = require('express-ipfilter').IpDeniedError

module.exports = (err, req, res) => {
  if (err instanceof IpDeniedError) {
    res.status(401).send('Forbidden')
  } else {
    // eslint-disable-next-line no-console
    console.error(err.stack)
    res.status(500).send('Internal Server Error')
  }
}
