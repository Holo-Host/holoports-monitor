const path = require("path");

module.exports = {
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist"),

  },
  entry: ["./src/index.js"],
  module: {
    rules: [
      { test: /\.js$/, include: /node_modules/, type: "javascript/auto" },
    ],
  },
  target: 'node',
  mode: "development",
};
