module.exports = {
  publicPath: '',
  outputDir: 'dist',
  pluginOptions: {
    quasar: {
      importStrategy: 'kebab',
      rtlSupport: false
    },
    cordovaPath: 'cordova'
  },
  transpileDependencies: [
    'quasar',
    /ckeditor5-[^/]+/
  ],
  pwa: {
    iconPaths: {
      favicon32: 'img/icons/favicon-96x96.png',
      favicon16: 'img/icons/favicon-96x96.png',
      appleTouchIcon: 'img/icons/apple-touch-icon.png',
      maskIcon: 'img/icons/safari-pinned-tab.svg',
      msTileImage: 'img/icons/mstile-150x150.png'
    }
  }
}
