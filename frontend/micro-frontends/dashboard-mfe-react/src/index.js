import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// The mount function will be called by the shell application
const mount = (el) => {
  const root = ReactDOM.createRoot(el);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
};

// This allows the app to run in isolation for development
if (process.env.NODE_ENV === 'development') {
  const devRoot = document.getElementById('root');
  if (devRoot) {
    mount(devRoot);
  }
}

// We export the mount function for the shell to use.
// We also create a dummy Angular module for compatibility with the loader.
export { mount };
export class DashboardModule {}