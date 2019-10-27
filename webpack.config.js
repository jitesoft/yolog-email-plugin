const Path = require('path');

module.exports = {
  mode: process.env.NODE_ENV,
  target: 'node',
  entry: [
    Path.join(__dirname, 'src', 'index.js')
  ],
  output: {
    filename: 'index.js',
    libraryTarget: 'umd',
    library: '@jitesoft/yolog-sentry-plugin',
    globalObject: 'this'
  },
  externals: {
    '@jitesoft/yolog': '@jitesoft/yolog',
    nodemailer: 'nodemailer'
  },
  module: {
    rules: [
      {
        include: Path.resolve(__dirname, 'src'),
        exclude: /node_modules/,
        test: /\.js$/,
        loader: 'babel-loader'
      }
    ]
  }
};
