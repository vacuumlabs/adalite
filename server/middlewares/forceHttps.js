module.exports = (req, res, next) => {
  if (!req.secure && req.get('x-forwarded-proto') !== 'https') {
    res.redirect(301, `https://${req.get('host')}${req.url}`)
  } else {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000')
    next()
  }
}
