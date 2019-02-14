const path = require('path');

module.exports = {
  chainWebpack: config => {
    const srcDir = config.resolve.alias.get('@');
    config.resolve.alias.set('styles', path.join(srcDir, 'assets/scss'));
  },

  devServer: {
    proxy: {
      '^/api': {
        target: '<url>',
        changeOrigin: true,
        pathRewrite: { '^/api': '' },
      },
    },
  },

  publicPath: process.env.NODE_ENV === 'production' ? '/production-sub-path/' : '/',
};