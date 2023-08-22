import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { store } from './app/store'
import { Provider } from 'react-redux'

const domRoot = document.getElementById('root') as HTMLElement
const root = ReactDOM.createRoot(domRoot);
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);