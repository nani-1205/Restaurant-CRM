const { ModuleFederationPlugin } = require('webpack').container;
const deps = require('./package.json').dependencies;

// This would be added to your webpack config's plugins array
new ModuleFederationPlugin({
  name: 'dashboard',
  filename: 'remoteEntry.js',
  exposes: {
    // Expose the file that handles mounting the React app
    './DashboardModule': './src/index',
  },
  shared: {
    ...deps,
    react: { singleton: true, requiredVersion: deps.react },
    'react-dom': { singleton: true, requiredVersion: deps['react-dom'] },
  },
})