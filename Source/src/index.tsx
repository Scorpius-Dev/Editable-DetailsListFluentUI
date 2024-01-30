import ReactDOM from 'react-dom/client';
import { App } from './App';
import React from 'react';
import './index.css';

const container = document.getElementById('root');
if (container === null) throw new Error('Root container missing in index.html');
const root = ReactDOM.createRoot(container);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
