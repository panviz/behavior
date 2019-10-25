import path from 'path'

function absolute (...args) {
  return path.join(__dirname, ...args)
}

const rules = [{
  test: /\.(scss|css)$/,
  use: ['style-loader', 'css-loader', 'sass-loader'],
}, {
  test: /\.csv/,
  loader: 'raw-loader',
}]

export default () => ({
  mode: 'development',
  entry: {
    demo: './app.js',
  },
  output: {
    path: absolute('dist'),
    filename: '[name].js',
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
    },
  },
  module: { rules },
  devtool: 'source-map',
})
