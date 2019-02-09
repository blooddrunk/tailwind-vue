const path = require('path');

module.exports = {
  publicPath: process.env.NODE_ENV === 'production' ? '/production-sub-path/' : '/',

  chainWebpack: config => {
    const srcDir = config.resolve.alias.get('@');
    config.resolve.alias.set('styles', path.join(srcDir, 'assets/scss'));
  },
};
