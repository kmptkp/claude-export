const { RawSource } = require('webpack-sources');

class URLEncodePlugin {
  apply(compiler) {
    compiler.hooks.emit.tapAsync('URLEncodePlugin', (compilation, callback) => {
      for (let filename in compilation.assets) {
        if (filename.endsWith('.js')) {
          const content = compilation.assets[filename].source();
          const encodedContent = 'javascript:' + encodeURIComponent(content);
          compilation.assets[filename + '.urlencoded'] = new RawSource(encodedContent);
          // compilation.assets[filename] = new RawSource(encodedContent);
        }
      }
      callback();
    });
  }
}

module.exports = URLEncodePlugin;