const path = require("path");

module.exports = {
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "dist"),

  },
  entry: {
    inspectAll: "./src/index.js",
},
  module: {
    rules: [
      { test: /\.js$/, include: /node_modules/, type: "javascript/auto" },
    ],
  },
  target: 'node',
  mode: "production",
};
