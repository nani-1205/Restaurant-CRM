import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// This function will be called by the Angular shell to mount the app
const mount = (el) => {
  const root = ReactDOM.createRoot(el);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
};

// This logic allows the app to run in isolation during development
if (process.env.NODE_ENV === 'development') {
  const devRoot = document.getElementById('root');
  if (devRoot) {
    mount(devRoot);
  }
}

// Export the mount function for the shell to use.
// Export a dummy class named 'DashboardModule' for compatibility with the Angular MFE loader.
export { mount };
export class DashboardModule {}