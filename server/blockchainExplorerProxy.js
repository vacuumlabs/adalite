require('isomorphic-fetch')

module.exports = function(app, env) {
  app.get('/api/addresses/summary/:address', async (req, res) => {
    const address = req.params.address

    const response = await request(`https://cardanoexplorer.com/api/addresses/summary/${address}`)

    return res.status(200).send(response)
  })
}

async function request(url, method = 'get', body = null, headers = {}) {
  const res = await fetch(url, {
    method,
    headers,
    body,
  })
  if (res.status >= 400) {
    throw new Error(res.status)
  }

  return res.json()
}
