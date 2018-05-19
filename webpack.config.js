const HtmlWebPackPlugin = require("html-webpack-plugin");
const path = require('path');
const webpack = require("webpack");

module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      },
      {
        test: /\.html$/,
        use: [
          {
            loader: "html-loader"
          }
        ]
      }
    ]
  },
  plugins: [
    new HtmlWebPackPlugin({
		template: "./src/mssql-report.html",
		filename: "./mssql-report.html"
    })
  ],
  output: {
    path: path.resolve(__dirname, './dist/'),
    filename: 'mssql-report.js'
  }
};