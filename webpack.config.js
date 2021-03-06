const path = require('path')
const nodeExternals = require('webpack-node-externals')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

const webpackconfig = {
  target: "node",
  mode: "development",
  entry: {
    serve: path.join(__dirname, "src/main.js")
  },
  output: {
    filename: "[name].bundle.js",
    path: path.join(__dirname, "./dist")
  },
  devtool: 'eval-source-map', 
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        use: {
          loader: 'babel-loader'
        },
        exclude: [path.join(__dirname, '/node_modules')]
      }
    ]
  },
  externals: [nodeExternals()],
  plugins: [ 
    new CleanWebpackPlugin()
  ],
  // node: {
  //   console: true,
  //   global: true,
  //   process: true,
  //   Buffer: true,
  //   __filename: true,
  //   __dirname: true,
  //   setImmediate: true,
  //   path: true 
  // }
}

module.exports = webpackconfig