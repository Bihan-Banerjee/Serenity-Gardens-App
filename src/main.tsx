import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import { startBackendWarmup } from './lib/warmup';
import './styles/app.css';
import './styles/motion.css';
import './styles/loading.css';

// Wake the backend before anything else renders.
startBackendWarmup();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>
);
