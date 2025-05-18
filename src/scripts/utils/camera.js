export default class Camera {
  #currentStream;
  #streaming = false;
  #width = 640;
  #height = 0;

  #videoElement;
  #selectCameraElement;
  #canvasElement;

  #takePictureButton;

  // Fungsi statis untuk menambahkan stream ke dalam array global
  static addNewStream(stream) {
    if (!Array.isArray(window.currentStreams)) {
      window.currentStreams = [stream];
      return;
    }

    // Menambahkan stream baru ke dalam array stream global
    window.currentStreams = [...window.currentStreams, stream];
  }

  // Fungsi statis untuk menghentikan semua stream yang aktif
  static stopAllStreams() {
    if (!Array.isArray(window.currentStreams)) {
      window.currentStreams = [];
      return;
    }

    // Menghentikan setiap track dari stream yang aktif
    window.currentStreams.forEach((stream) => {
      if (stream.active) {
        stream.getTracks().forEach((track) => track.stop());
      }
    });
  }

  // Konstruktor yang menerima elemen-elemen HTML dan opsi lainnya
  constructor({ video, cameraSelect, canvas, options = {} }) {
    this.#videoElement = video;
    this.#selectCameraElement = cameraSelect;
    this.#canvasElement = canvas;

    this.#initialListener();
  }

  // Menyiapkan event listener untuk elemen-elemen HTML
  #initialListener() {
    this.#videoElement.oncanplay = () => {
      if (this.#streaming) {
        return;
      }

      this.#height = (this.#videoElement.videoHeight * this.#width) / this.#videoElement.videoWidth;

      this.#canvasElement.setAttribute('width', this.#width);
      this.#canvasElement.setAttribute('height', this.#height);

      this.#streaming = true;
    };

    this.#selectCameraElement.onchange = async () => {
      await this.stop();
      await this.launch();
    };
  }

  // Mengisi daftar perangkat kamera yang tersedia pada dropdown
  async #populateDeviceList(stream) {
    try {
      if (!(stream instanceof MediaStream)) {
        return Promise.reject(Error('MediaStream not found!'));
      }

      const { deviceId } = stream.getVideoTracks()[0].getSettings();
      // Mendapatkan semua perangkat media yang tersedia
      const enumeratedDevices = await navigator.mediaDevices.enumerateDevices();
      // Memfilter perangkat hanya untuk input video
      const list = enumeratedDevices.filter((device) => {
        return device.kind === 'videoinput';
      });

      // Menghasilkan HTML option untuk setiap kamera
      const html = list.reduce((accumulator, device, currentIndex) => {
        return accumulator.concat(`
          <option
            value="${device.deviceId}"
            ${deviceId === device.deviceId ? 'selected' : ''}
          >
            ${device.label || `Camera ${currentIndex + 1}`}
          </option>
        `);
      }, '');

      // Mengisi elemen select dengan HTML option yang dihasilkan
      this.#selectCameraElement.innerHTML = html;
    } catch (error) {
      console.error('#populateDeviceList: error:', error);
    }
  }

  // Mendapatkan stream video dari kamera
  async #getStream() {
    try {
      const deviceId =
        !this.#streaming && !this.#selectCameraElement.value
          ? undefined
          : { exact: this.#selectCameraElement.value };

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          aspectRatio: 4 / 3,
          deviceId,
        },
      });

      // Show available camera after camera permission granted
      await this.#populateDeviceList(stream);

      return stream;
    } catch (error) {
      console.error('#getStream: error:', error);
      return null;
    }
  }

  // Fungsi untuk memulai stream kamera
  async launch() {
    this.#currentStream = await this.#getStream();

    // Record all MediaStream in global context
    Camera.addNewStream(this.#currentStream);

    this.#videoElement.srcObject = this.#currentStream;
    this.#videoElement.play();

    this.#clearCanvas();
  }

  // Fungsi untuk menghentikan stream video
  stop() {
    if (this.#videoElement) {
      this.#videoElement.srcObject = null;
      this.#streaming = false;
    }

    if (this.#currentStream instanceof MediaStream) {
      this.#currentStream.getTracks().forEach((track) => {
        track.stop();
      });
    }

    this.#clearCanvas();
  }

  // Fungsi untuk membersihkan canvas (mengisi dengan warna abu-abu)
  #clearCanvas() {
    const context = this.#canvasElement.getContext('2d');
    context.fillStyle = '#AAAAAA';
    context.fillRect(0, 0, this.#canvasElement.width, this.#canvasElement.height);
  }

  // Fungsi untuk mengambil foto dari video stream
  async takePicture() {
    if (!(this.#width && this.#height)) {
      return null;
    }

    const context = this.#canvasElement.getContext('2d');

    this.#canvasElement.width = this.#width;
    this.#canvasElement.height = this.#height;

    context.drawImage(this.#videoElement, 0, 0, this.#width, this.#height);

    return await new Promise((resolve) => {
      this.#canvasElement.toBlob((blob) => resolve(blob));
    });
  }

  // Fungsi untuk menambahkan listener pada tombol pengambil foto
  addCheeseButtonListener(selector, callback) {
    this.#takePictureButton = document.querySelector(selector);
    this.#takePictureButton.onclick = callback;
  }
}
