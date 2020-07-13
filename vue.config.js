module.exports = {
  pluginOptions: {
    apollo: {
      enableMocks: true,
      enableEngine: false,
    },
  },
  transpileDependencies: [
    '@ej/',
  ],
  chainWebpack: config => {
    // GraphQL Loader
    config.module.rule('externalsgql')
      .test(/.(graphql|gql)$/)
      .include.add(/externals/)
      .end()
      .use('graphql-tag/loader')
      .loader('graphql-tag/loader')
      .end()

    config.devServer.disableHostCheck(true)
  },
  devServer: {
    before (app) {
      app.get('/runtime-args.json', (req, res) => {
        res.send(require('./runtime-args.dev.json'))
      })
    },
  },
}
