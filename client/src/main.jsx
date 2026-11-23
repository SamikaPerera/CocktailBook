// Front-end entry point: mounts the React app into <div id="root">.
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import './index.css';

// Register the service worker (src/sw.js) for offline support.
// "virtual:pwa-register" is provided by vite-plugin-pwa. With
// registerType "autoUpdate", a new app version activates automatically.
import { registerSW } from 'virtual:pwa-register';

registerSW({ immediate: true });

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* BrowserRouter gives every component access to the URL / navigation */}
    <BrowserRouter>
      {/* AuthProvider makes the logged-in user available everywhere */}
      <AuthProvider>
        {/* ToastProvider lets any page show a short pop-up message */}
        <ToastProvider>
          <App />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
