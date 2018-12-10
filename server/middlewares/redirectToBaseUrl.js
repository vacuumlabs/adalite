module.exports = (req, res, next) => {
  if (`${req.protocol}://${req.get('host')}` !== process.env.ADALITE_SERVER_URL) {
    res.redirect(301, `${process.env.ADALITE_SERVER_URL}${req.originalUrl}`)
  } else {
    next()
  }
}
