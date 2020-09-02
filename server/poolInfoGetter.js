require('isomorphic-fetch')

module.exports = function(app, env) {
  // eslint-disable-next-line consistent-return
  app.post('/api/poolMeta', async (req, res) => {
    const poolUrl = req.body.poolUrl
    try {
      const response = await fetch(poolUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
        mode: 'no-cors',
      })
      const a = await response.json()

      if (response.status === 200) {
        return res.json({
          ...a,
        })
      }
    } catch (err) {
      return res.json({})
    }
  })
}
