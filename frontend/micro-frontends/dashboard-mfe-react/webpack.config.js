const { ModuleFederationPlugin } = require('webpack').container;
const deps = require('./package.json').dependencies;

// Inside your webpack config's plugins array:
new ModuleFederationPlugin({
  name: 'dashboard',
  filename: 'remoteEntry.js',
  exposes: {
    // This is tricky for React. We expose a wrapper that mounts the app.
    './DashboardModule': './src/DashboardModuleWrapper', 
  },
  shared: {
    ...deps,
    react: { singleton: true, requiredVersion: deps.react },
    'react-dom': { singleton: true, requiredVersion: deps['react-dom'] },
  },
})