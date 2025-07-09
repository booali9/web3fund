import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';
import Web3ContextProvider from './web3/Web3Provider';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Web3ContextProvider>
      <App />
    </Web3ContextProvider>
  </React.StrictMode>
);