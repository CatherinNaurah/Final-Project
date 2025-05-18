import NewPresenter from './new-presenter';
import * as MyAPI from '../../data/api';
import { convertBase64ToBlob } from '../../utils';
import Camera from '../../utils/camera';
import Map from '../../utils/map';

export default class NewPage {
  #presenter = null;
  #camera;
  #isCameraOpen = false;
  #takenDocumentations = [];
  #map = null;

  async render() {
    return `
     <div class="new-report-form">
      <h1 id="form-title" tabindex="0" aria-label="buat story">Buat Story</h1>
      <form id="reportForm">
        <div class="form-group">
          <label for="reportDescription">Description</label>
          <textarea id="reportDescription" name="description" required></textarea>
        </div>

        <div class="form-control">
          <label for="documentations-input" class="new-form__documentations__title">Dokumentasi</label>
          <div id="documentations-more-info">Anda dapat menyertakan foto sebagai dokumentasi.</div>

          <div class="new-form__documentations__container">
            <div class="new-form__documentations__buttons">
              <button id="documentations-input-button" class="btn btn-outline" type="button">
                Ambil Gambar
              </button>
              <input
                id="documentations-input"
                name="documentations"
                type="file"
                accept="image/*"
                multiple
                hidden="hidden"
                aria-multiline="true"
                aria-describedby="documentations-more-info"
              >
              <button id="open-documentations-camera-button" class="btn btn-outline" type="button">
                Buka Kamera
              </button>
            </div>
            <div id="camera-container" class="new-form__camera__container">
              <video id="camera-video" class="new-form__camera__video">
                Video stream not available.
              </video>
              <canvas id="camera-canvas" class="new-form__camera__canvas"></canvas>

              <div class="new-form__camera__tools">
                <select id="camera-select"></select>
                <div class="new-form__camera__tools_buttons">
                  <button id="camera-take-button" class="btn" type="button">
                    Ambil Gambar
                  </button>
                </div>
              </div>
            </div>
            <ul id="documentations-taken-list" class="new-form__documentations__outputs"></ul>
          </div>
        </div>

        <div class="form-control">
          <div class="new-form__location__title">Lokasi</div>

          <div class="new-form__location__container">
            <div class="new-form__location__map__container">
              <div id="map-marker" class="new-form__location__map"></div>
              <div id="map-loading-container"></div>
            </div>
            <div class="new-form__location__lat-lng">
              <input id="reportLat" name="lat" value="-6.175389" />
              <input id="reportLon" name="lon" value="106.827139" />
            </div>
          </div>
        </div>
        <button type="submit" class="btn btn-outline">Submit</button>
      </form>
      </div>
    `;
  }

  async afterRender() {
    this.#presenter = new NewPresenter({
      view: this,
      model: MyAPI,
    });
    this.#takenDocumentations = [];

    await this.setupForm();
    await this.initialMap();
    await this.setupSkipToContent();
  }

  async setupSkipToContent() {
    const skipEl = document.getElementById('skip-link');

    skipEl.addEventListener('click', () => {
      document.getElementById('form-title').focus();
    })
    skipEl.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        document.getElementById('form-title').focus();
      }
    });
  }

  async initialMap() {
    this.#map = await Map.build('#map-marker', {
      zoom: 15,
      locate: true,
    });

    // Preparing marker for select coordinate
    const centerCoordinate = this.#map.getCenter();
    const draggableMarker = this.#map.addMarker(
      [centerCoordinate.latitude, centerCoordinate.longitude],
      { draggable: 'true' },
    );
    draggableMarker.addEventListener('move', (event) => {
      const coordinate = event.target.getLatLng();
      this.#updateLatLngInput(coordinate.lat, coordinate.lng);
    });

    this.#map.addMapEventListener('click', (event) => {
      draggableMarker.setLatLng(event.latlng);
      event.sourceTarget.flyTo(event.latlng);
    });
  }

  #updateLatLngInput(latitude, longitude) {
    document.getElementById('reportLat').value = latitude;
    document.getElementById('reportLon').value = longitude;
  }

  async setupForm() {
    const form = document.getElementById('reportForm');
    if (!form) {
      return
    }
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      try {
        const data = {
          description: form.elements.namedItem('description').value,
          lat: form.elements.namedItem('lat').value,
          lon: form.elements.namedItem('lon').value,
          photo: this.#takenDocumentations.map((picture) => picture.blob),
        };

        console.log('Submitting report:', data);

        await this.#presenter.postStory(data);
        alert('Report submitted successfully!');
      } catch (error) {
        console.error('Error submitting report:', error);
        alert('Failed to submit report. Please try again.');
      }
    });

    document.getElementById('documentations-input').addEventListener('change', async (event) => {
      const insertingPicturesPromises = Object.values(event.target.files).map(async (file) => {
        return await this.#addTakenPicture(file);
      });
      await Promise.all(insertingPicturesPromises);

      await this.#populateTakenPictures();
    });

    document.getElementById('documentations-input-button').addEventListener('click', () => {
      form.elements.namedItem('documentations-input').click();
    });

    const cameraContainer = document.getElementById('camera-container');
    document
      .getElementById('open-documentations-camera-button')
      .addEventListener('click', async (event) => {
        cameraContainer.classList.toggle('open');
        this.#isCameraOpen = cameraContainer.classList.contains('open');

        if (this.#isCameraOpen) {
          event.currentTarget.textContent = 'Tutup Kamera';
          this.#setupCamera();
          await this.#camera.launch();

          return;
        }

        event.currentTarget.textContent = 'Buka Kamera';
        this.#camera.stop();
      });
  }

  #setupCamera() {
    if (!this.#camera) {
      this.#camera = new Camera({
        video: document.getElementById('camera-video'),
        cameraSelect: document.getElementById('camera-select'),
        canvas: document.getElementById('camera-canvas'),
      });
    }

    this.#camera.addCheeseButtonListener('#camera-take-button', async () => {
      const image = await this.#camera.takePicture();
      await this.#addTakenPicture(image);
      await this.#populateTakenPictures();
    });
  }

  async #addTakenPicture(image) {
    let blob = image;

    if (image instanceof String) {
      blob = await convertBase64ToBlob(image, 'image/png');
    }

    const newDocumentation = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      blob: blob,
    };
    this.#takenDocumentations = [...this.#takenDocumentations, newDocumentation];
  }

  async #populateTakenPictures() {
    const html = this.#takenDocumentations.reduce((accumulator, picture, currentIndex) => {
      const imageUrl = URL.createObjectURL(picture.blob);
      return accumulator.concat(`
        <li class="new-form__documentations__outputs-item">
          <button type="button" data-deletepictureid="${picture.id}" class="new-form__documentations__outputs-item__delete-btn">
            <img src="${imageUrl}" alt="Dokumentasi ke-${currentIndex + 1}">
          </button>
        </li>
      `);
    }, '');

    document.getElementById('documentations-taken-list').innerHTML = html;

    document.querySelectorAll('button[data-deletepictureid]').forEach((button) =>
      button.addEventListener('click', (event) => {
        const pictureId = event.currentTarget.dataset.deletepictureid;

        const deleted = this.#removePicture(pictureId);
        if (!deleted) {
          console.log(`Picture with id ${pictureId} was not found`);
        }

        // Updating taken pictures
        this.#populateTakenPictures();
      }),
    );
  }

  #removePicture(id) {
    const selectedPicture = this.#takenDocumentations.find((picture) => {
      return picture.id == id;
    });

    // Check if founded selectedPicture is available
    if (!selectedPicture) {
      return null;
    }

    // Deleting selected selectedPicture from takenPictures
    this.#takenDocumentations = this.#takenDocumentations.filter((picture) => {
      return picture.id != selectedPicture.id;
    });

    return selectedPicture;
  }
}