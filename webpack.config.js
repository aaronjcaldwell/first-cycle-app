var path = require("path");

module.exports = {
  entry: {
    app: ["./index.js"]
  },
  mode: 'development',
  output: {
    path: path.resolve(__dirname, "build"),
    publicPath: "/cycle/",
    filename: "main.js"
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  }
};