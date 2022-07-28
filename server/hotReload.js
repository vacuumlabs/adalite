const getWaitTillReady = (devServerInstance) =>
  new Promise((resolve) => {
    devServerInstance.waitUntilValid(() => resolve())
  })

const enableHotReload = (app) => {
  const webpack = require('webpack')
  const devMiddleware = require('webpack-dev-middleware')
  const hotMiddleware = require('webpack-hot-middleware')
  const config = require('../webpack.build.config')
  const compiler = webpack(config)

  const _devServerInstance = devMiddleware(compiler, {
    publicPath: config.output.publicPath,
  })
  devServerInstance = _devServerInstance
  app.use(_devServerInstance)

  app.use(
    hotMiddleware(compiler, {
      path: '/__webpack_hmr',
    })
  )

  return getWaitTillReady(_devServerInstance)
}

module.exports = {
  enableHotReload,
}
