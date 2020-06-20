const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const demoConfig = require('./webpack.demo');
const webpack = require('webpack');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin'); // 这个我手动加的, 不加的话, loader处会报错

demoConfig.entry = {
  background: path.join(process.cwd(), './examples/extension/src/background'),
  entry: path.join(process.cwd(), './examples/extension/src/entry')
};
demoConfig.output = {
  path: path.join(process.cwd(), './examples/extension/dist'),
  filename: '[name].js'
};
demoConfig.plugins = [
  new CopyWebpackPlugin([
    { from: 'examples/extension/src/manifest.json' },
    { from: 'examples/extension/src/icon.png' }
  ]),
  new VueLoaderPlugin(),
  new ProgressBarPlugin(),
  new webpack.LoaderOptionsPlugin({
    vue: {
      compilerOptions: {
        preserveWhitespace: false
      }
    }
  }),
  new webpack.HotModuleReplacementPlugin(),
  new MiniCssExtractPlugin() // 这个我手动加的, 不加的话, loader处会报错 npm run deploy:extension 会报错
];
demoConfig.module.rules.find(a => a.loader === 'url-loader').query = {};
module.exports = demoConfig;
