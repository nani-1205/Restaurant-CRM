const { ModuleFederationPlugin } = require('webpack').container;
const deps = require('./package.json').dependencies;

// Add this to your webpack config's plugins array
new ModuleFederationPlugin({
  name: 'dashboard',
  filename: 'remoteEntry.js',
  exposes: {
    './DashboardModule': './src/index', // Expose the file that mounts the app
  },
  shared: {
    ...deps,
    react: { singleton: true, requiredVersion: deps.react },
    'react-dom': { singleton: true, requiredVersion: deps['react-dom'] },
  },
})