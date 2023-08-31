import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { store } from './app/store'
import { Provider } from 'react-redux'
import initRust, { startWebSocket } from 'wghub-rust-web'
import { AppContext } from './AppContext';

const domRoot = document.getElementById('root') as HTMLElement
const root = ReactDOM.createRoot(domRoot);

initRust().then(() => {
  startWebSocket().then(serverCtx => {
    root.render(
      <React.StrictMode>
        <AppContext.Provider value={{server: serverCtx}}>
          <Provider store={store}>
            <App />
          </Provider>
        </AppContext.Provider>
      </React.StrictMode>
    );
  })
})