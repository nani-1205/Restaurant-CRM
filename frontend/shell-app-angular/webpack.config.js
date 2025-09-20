const { shareAll, withModuleFederationPlugin } = require('@angular-architects/module-federation/webpack');

module.exports = withModuleFederationPlugin({
  remotes: {
    // These URLs point to the local dev servers of the MFEs.
    // In production, these would be https://sparkdevop.com/pos/remoteEntry.js, etc.
    'pos': 'http://localhost:4201/remoteEntry.js',
    'dashboard': 'http://localhost:4202/remoteEntry.js',
  },
  shared: {
    ...shareAll({ singleton: true, strictVersion: true, requiredVersion: 'auto' }),
  },
});