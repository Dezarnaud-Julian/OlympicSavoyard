const path = require("path");
const webpack = require("webpack");

module.exports = {
  context: __dirname,
  entry: [path.resolve(__dirname, "./src")],
  output: {
    path: path.resolve(__dirname),
    filename: "app.js",
  },
  devtool: "none",
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "ts-loader",
      },
      {
        test: /\dynamicTerrain.js\.js$/,
        use: ['imports-loader?BABYLON=>require("babylonjs")'],
      },
    ],
  },
  mode: "development",
  plugins: [
    new webpack.ProvidePlugin({
      BABYLON: "babylonjs",
    }),
  ],
};
