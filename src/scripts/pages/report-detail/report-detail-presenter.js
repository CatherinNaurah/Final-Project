
export default class ReportDetailPresenter {
  #reportId;
  #view;
  #model;
  #db;

  constructor(reportId, { view, model, db }) {
    this.#reportId = reportId;
    this.#view = view;
    this.#model = model;
    this.#db = db;
  }

  async showReportDetail() {
    try {
      const response = await this.#model.getReportById(this.#reportId);

      if (!response.story) {
        location.hash = '/404';
        return;
      }

      if (!response.ok) {
        return;
      }

      this.#view.renderStories(response.story)
      this.#view.setupSaveStory(response.story);
    } catch (error) {
      const isDataExist = await this.#db.getReportById(this.#reportId);

      if (isDataExist) {
        this.#view.renderStories(isDataExist);
        this.#view.setupSaveStory(isDataExist);
      } else {
        console.error('showReportDetail: error:', error);
      }
    } finally {
    }
  }
}