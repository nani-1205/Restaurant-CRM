const HtmlWebpackPlugin = require('html-webpack-plugin');
const { ModuleFederationPlugin } = require('webpack').container;
const deps = require('./package.json').dependencies;

module.exports = {
  // ... (same mode, output, module config as container-app)
  devServer: { port: 3001 },
  plugins: [
    new ModuleFederationPlugin({
      name: 'pos',
      filename: 'remoteEntry.js',
      exposes: {
        './POSPage': './src/POSPage',
      },
      shared: {
        ...deps,
        react: { singleton: true, requiredVersion: deps.react },
        'react-dom': { singleton: true, requiredVersion: deps['react-dom'] },
        'antd': { singleton: true, requiredVersion: deps.antd },
      },
    }),
    new HtmlWebpackPlugin({ template: './public/index.html' }),
  ],
};