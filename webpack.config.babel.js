import path from 'path'

export default () => ({
  mode: 'development',
  entry: {
    behavior: './index.js',
    test: './test/specs',
  },
  module: {
    rules: [{
      test: /\.(scss|css)$/,
      use: ['style-loader', 'css-loader', 'sass-loader'],
    }],
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].js',
  },
  devtool: 'source-map',
})
