import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// Polices auto-hébergées (@fontsource) : interface + univers pixel de Machamp
import '@fontsource-variable/inter/wght.css';
import '@fontsource/press-start-2p/400.css';
import '@fontsource/pixelify-sans/400.css';
import '@fontsource/pixelify-sans/600.css';
import './styles/theme.css';
import './styles/app.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
