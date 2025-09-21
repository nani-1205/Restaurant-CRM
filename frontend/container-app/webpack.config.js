const HtmlWebpackPlugin = require('html-webpack-plugin');
const { ModuleFederationPlugin } = require('webpack').container;
const path = require('path');
const deps = require('./package.json').dependencies;

// NOTE: In production, these URLs must point to your domain
const POS_MFE_URL = process.env.NODE_ENV === 'production' ? 'https://sparkdevop.com/pos/' : 'http://localhost:3001/';
const DASHBOARD_MFE_URL = process.env.NODE_ENV === 'production' ? 'https://sparkdevop.com/dashboard/' : 'http://localhost:3002/';
const EMPLOYEES_MFE_URL = process.env.NODE_ENV === 'production' ? 'https://sparkdevop.com/employees/' : 'http://localhost:3003/';

module.exports = {
  entry: './src/index.js',
  mode: 'development',
  devServer: {
    port: 3000,
    historyApiFallback: true, // Important for routing
  },
  output: {
    publicPath: 'auto',
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        options: {
          presets: ['@babel/preset-react'],
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'container',
      remotes: {
        pos: `pos@${POS_MFE_URL}remoteEntry.js`,
        dashboard: `dashboard@${DASHBOARD_MFE_URL}remoteEntry.js`,
        employees: `employees@${EMPLOYEES_MFE_URL}remoteEntry.js`,
      },
      shared: {
        ...deps,
        react: { singleton: true, requiredVersion: deps.react },
        'react-dom': { singleton: true, requiredVersion: deps['react-dom'] },
        'antd': { singleton: true, requiredVersion: deps.antd },
      },
    }),
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
  ],
};