const TerserPlugin = require('terser-webpack-plugin');
const URLEncodePlugin = require('./URLEncodePlugin');
const path = require('path');

module.exports = (env, argv) => {
  const outputDir = env.outputDir || 'dist';

  return {
  entry: {
    "json": "./src/exportJSON.js",
    "md": "./src/exportMarkdown.js",
    "image": "./src/exportImage.js",
  },
  output: {
    filename: '[name].min.js',
    path: path.resolve(__dirname, outputDir)
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        extractComments: true,
        terserOptions: {
          compress: {
            drop_console: false,
          }
        }
      })
    ]
  },
  plugins: [
    new URLEncodePlugin()
  ]
};
};
