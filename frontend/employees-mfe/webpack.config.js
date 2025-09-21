const HtmlWebpackPlugin = require('html-webpack-plugin');
const { ModuleFederationPlugin } = require('webpack').container;
const deps = require('./package.json').dependencies;

module.exports = {
  // ... (same mode, output, module config as container-app)
  devServer: { port: 3003 },
  plugins: [
    new ModuleFederationPlugin({
      name: 'employees',
      filename: 'remoteEntry.js',
      exposes: {
        './EmployeesPage': './src/EmployeesPage',
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