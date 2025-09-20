import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const mount = (el) => {
  const root = ReactDOM.createRoot(el);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
};

// This is for running the app in isolation
if (process.env.NODE_ENV === 'development') {
  const devRoot = document.querySelector('#root');
  if (devRoot) {
    mount(devRoot);
  }
}

// We export the mount function for the shell to use
export { mount };