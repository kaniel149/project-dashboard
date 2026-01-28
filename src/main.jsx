import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

console.log('Main.jsx loaded');

try {
  const root = document.getElementById('root');
  console.log('Root element:', root);

  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log('React rendered');
} catch (e) {
  console.error('React render error:', e);
  document.body.innerHTML = `<div style="color: red; padding: 20px;">Error: ${e.message}</div>`;
}
