import { createCarousel } from '../../utils';
import ReportDetailPresenter from './report-detail-presenter';
import { parseActivePathname } from '../../routes/url-parser';
import Map from '../../utils/map';
import * as MyAPI from '../../data/api';
import { generateReportDetailTemplate } from '../../templates';
import Database from '../../data/database';

export default class ReportDetailPage {
  #presenter = null;
  #form = null;
  #map = null;

  async render() {
    return `
      <section>
        <div class="report-detail__container">
          <div id="report-detail" class="report-detail"></div>
          <div id="report-detail-loading-container"></div>
          <button id="btn-save-story">Simpan Story</button>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new ReportDetailPresenter(parseActivePathname().id, {
      view: this,
      model: MyAPI,
      db: Database,
    });

    this.#presenter.showReportDetail();
  }

  async renderStories(data) {
    const elList = document.getElementById('report-detail')
    const elItem = document.createElement('div')
    elItem.classList.add('reports-list__item')
    elItem.innerHTML = generateReportDetailTemplate(data)
    elList.appendChild(elItem)
  }

  async setupSaveStory(data) {
    const btnSaveStory = document.getElementById('btn-save-story');
    const isSaved = await Database.getReportById(data.id);

    if (isSaved) {
      btnSaveStory.textContent = 'Hapus Story';
    } else {
      btnSaveStory.textContent = 'Simpan Story';
    }

    btnSaveStory.addEventListener('click', async () => {
      if (await Database.getReportById(data.id)) {
        await Database.removeReport(data.id);
        btnSaveStory.textContent = 'Simpan Story';
        alert('Story berhasil dihapus');
      } else {
        await Database.putReport(data);
        btnSaveStory.textContent = 'Hapus Story';
        alert('Story berhasil disimpan');
      }
    });
  }

  async initialMap() {
    this.#map = await Map.build('#map', {
      zoom: 15,
    });
  }
}
