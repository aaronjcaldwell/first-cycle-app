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
  }
};