// CSS imports
import '../styles/styles.css';
import 'leaflet/dist/leaflet.css';

import App from './pages/app';
import Camera from './utils/camera'; // Pastikan path ini sesuai dengan lokasi Camera.js kamu
import { registerServiceWorker } from './utils';

document.addEventListener('DOMContentLoaded', async () => {
  const app = new App({
    content: document.querySelector('#main-content'),
    navbar: document.querySelector('#navigation-container'),
  });
  await app.renderPage();
  await registerServiceWorker();
  console.log('Berhasil mendaftarkan service worker.');

  window.addEventListener('hashchange', async () => {
    await app.renderPage();

    // Stop all active media (kamera) ketika navigasi berubah
    Camera.stopAllStreams();
  });
});
