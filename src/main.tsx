import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { initializeFirebaseAppCheck } from './lib/firebase/appCheck';
import { connectFirebaseEmulators } from './lib/firebase/emulators';
import { AuthProvider } from './providers/AuthProvider';
import { ThemeProvider } from './providers/ThemeProvider';
import './index.css';

connectFirebaseEmulators();
initializeFirebaseAppCheck();

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('O elemento raiz da aplicação não foi encontrado.');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ThemeProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);
