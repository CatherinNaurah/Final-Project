import HomePresenter from './home-presenter';
import * as MyAPI from '../../data/api';
import { generateReportItemTemplate } from '../../templates';
import Map from '../../utils/map';
import Database from '../../data/database';

export default class HomePage {
  #presenter = null;
  #map = null;

  async render() {
    return `
      <section>
        <h1 class="section-title">Map Dicoding Story</h1>
        <div class="reports-list__map__container">
          <div id="map" class="reports-list__map" tabindex="-1"></div>
          <div id="map-loading-container" tabindex="-1"></div>
        </div>
      </section>

      <section class="container">
      <h1 class="section-title">Home Dicoding Story</h1>
        <div id="reports-list" class="reports-list"></div>
        <div id="reports-list-loading-container" tabindex="-1"></div>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new HomePresenter({
      view: this,
      model: MyAPI,
      db: Database
    });

    await this.#presenter.getStories();
    await this.setupSkipToContent();
  }

  async setupSkipToContent() {
    const skipEl = document.getElementById('skip-link');

    skipEl.addEventListener('click', () => {
      document.getElementById('reports-list').firstElementChild.focus();
    })
    skipEl.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        document.getElementById('reports-list').firstElementChild.focus();
      }
    });
  }

  async initialMap() {
    this.#map = await Map.build('#map', {
      zoom: 10,
      locate: true,
    });
  }

  async renderStories(data) {
    if (data.length <= 0) {
      return;
    }

    const elList = document.getElementById('reports-list')

    data.forEach((story) => {
      const elItem = document.createElement('div')
      elItem.classList.add('reports-list__item')
      elItem.innerHTML = generateReportItemTemplate(story)
      elList.appendChild(elItem)
    })

    const mappedReports = await Promise.all(
      data.map(async (report) => {
        try {
          const placeName = await Map.getPlaceNameByCoordinate(
            report.lat,
            report.lon
          );

          return {
            ...report,
            location: {
              lat: report.lat,
              lon: report.lon,
              placeName: placeName
            }
          };
        } catch (error) {
          console.error('Error getting place name:', error);
          return {
            ...report,
            location: {
              lat: report.lat,
              lon: report.lon,
              placeName: `${report.lat}, ${report.lon}`
            }
          };
        }
      })
    );

    const html = mappedReports.reduce((accumulator, report) => {
      if (this.#map && report.location && report.location.lat && report.location.lon) {
        const coordinate = [report.location.lat, report.location.lon];
        const markerOptions = { alt: report.name };
        const popupOptions = { content: report.name };
        this.#map.addMarker(coordinate, markerOptions, popupOptions);
      }

      return accumulator.concat(
        generateReportItemTemplate({
          ...report,
          reporterName: report.name,
        }),
      );
    }, '');

    document.getElementById('reports-list').innerHTML = html;
  }
}