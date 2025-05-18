import { map, tileLayer, Icon, icon, marker, popup, latLng } from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { MAP_SERVICE_API_KEY } from '../config';

export default class Map {
  #zoom = 5;
  #map = null;

  // Mendapatkan nama lokasi dari koordinat menggunakan API MapTiler
  static async getPlaceNameByCoordinate(latitude, longitude) {
    try {
      const url = new URL(`https://api.maptiler.com/geocoding/${longitude},${latitude}.json`);
      url.searchParams.set('key', MAP_SERVICE_API_KEY);// API key
      url.searchParams.set('language', 'id');// Bahasa Indonesia
      url.searchParams.set('limit', '1');// Hanya ambil 1 hasil

      const response = await fetch(url);
      const json = await response.json();

      // Memecah nama tempat, dan ambil dua bagian terakhir
      const place = json.features[0].place_name.split(', ');
      return [place.at(-2), place.at(-1)].map((name) => name).join(', ');
    } catch (error) {
      console.error('getPlaceNameByCoordinate: error:', error);
      return `${latitude}, ${longitude}`; // Fallback: kembalikan koordinat
    }
  }

  // Cek apakah browser mendukung Geolocation API
  static isGeolocationAvailable() {
    return 'geolocation' in navigator;
  }

  // Mendapatkan posisi saat ini sebagai Promise
  static getCurrentPosition(options = {}) {
    return new Promise((resolve, reject) => {
      if (!Map.isGeolocationAvailable()) {
        reject('Geolocation API unsupported');
        return;
      }

      navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });
  }

  /**
  * Membangun instance Map secara async.
  * Jika opsi `locate` diberikan, akan mencoba mendapatkan lokasi saat ini.
  * Jika gagal, default ke koordinat Jakarta.
  */
  /**
   * Reference of using this static method:
   * https://stackoverflow.com/questions/43431550/how-can-i-invoke-asynchronous-code-within-a-constructor
   * */
  static async build(selector, options = {}) {
    if ('center' in options && options.center) {
      return new Map(selector, options);
    }

    const jakartaCoordinate = [-6.2, 106.816666];

    // Using Geolocation API
    if ('locate' in options && options.locate) {
      try {
        const position = await Map.getCurrentPosition();// Coba ambil lokasi saat ini
        const coordinate = [position.coords.latitude, position.coords.longitude];

        return new Map(selector, {
          ...options,
          center: coordinate,
        });
      } catch (error) {
        console.error('build: error:', error);// Gagal ambil lokasi → fallback

        return new Map(selector, {
          ...options,
          center: jakartaCoordinate,
        });
      }
    }

    // Jika tidak ada center dan tidak ingin locate, pakai default Jakarta
    return new Map(selector, {
      ...options,
      center: jakartaCoordinate,
    });
  }

  // Konstruktor: membuat objek peta pada selector tertentu
  constructor(selector, options = {}) {
    this.#zoom = options.zoom ?? this.#zoom;
    // Layer OSM sebagai background
    const tileOsm = tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
    });
    // Inisialisasi objek peta
    this.#map = map(document.querySelector(selector), {
      zoom: this.#zoom,
      scrollWheelZoom: false,
      layers: [tileOsm],
      ...options,
    });
  }
  // Mengubah tampilan kamera ke koordinat tertentu
  changeCamera(coordinate, zoomLevel = null) {
    if (!zoomLevel) {
      this.#map.setView(latLng(coordinate), this.#zoom);
      return;
    }
    this.#map.setView(latLng(coordinate), zoomLevel);
  }
  // Membuat ikon marker dengan konfigurasi default (termasuk gambar)
  createIcon(options = {}) {
    return icon({
      ...Icon.Default.prototype.options,
      iconRetinaUrl: markerIcon2x,
      iconUrl: markerIcon,
      shadowUrl: markerShadow,
      ...options,
    });
  }
  // Menambahkan marker ke peta
  addMarker(coordinates, markerOptions = {}, popupOptions = null) {
    if (typeof markerOptions !== 'object') {
      throw new Error('markerOptions must be an object');
    }
    const newMarker = marker(coordinates, {
      icon: this.createIcon(),
      ...markerOptions,
    });
    // Jika ada popup, buat dan bind ke marker
    if (popupOptions) {
      if (typeof popupOptions !== 'object') {
        throw new Error('popupOptions must be an object');
      }
      if (!('content' in popupOptions)) {
        throw new Error('popupOptions must include `content` property.');
      }
      const newPopup = popup(coordinates, popupOptions);
      newMarker.bindPopup(newPopup);
    }
    newMarker.addTo(this.#map);// Tambahkan marker ke peta
    return newMarker;
  }

  getCenter() {
    const { lat, lng } = this.#map.getCenter();
    return {
      latitude: lat,
      longitude: lng,
    };
  }

  addMapEventListener(eventName, callback) {
    this.#map.addEventListener(eventName, callback);
  }
}
