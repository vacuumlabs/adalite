module.exports = (req, res, next) => {
  if (process.env.HEROKU_IS_REVIEW_APP === 'true') {
    // No redirect for review apps
    // We can not set `ADALITE_SERVER_URL` for them as their URLs are unique and generated
    next()
  } else if (`${req.protocol}://${req.get('host')}` !== process.env.ADALITE_SERVER_URL) {
    res.redirect(301, `${process.env.ADALITE_SERVER_URL}${req.originalUrl}`)
  } else {
    next()
  }
}
