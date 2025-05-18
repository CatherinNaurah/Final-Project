export default class HomePresenter {
  #view;
  #model;
  #db;

  constructor({ view, model, db }) {
    this.#view = view;
    this.#model = model;
    this.#db = db;
  }

  async getStories() {
    try {
      const response = await this.#db.getAllSavedReports();
      this.#view.renderStories(response)
    } catch (error) {
      this.#view.renderStories([])
      console.error('getStories: error:', error);
    } finally {
    }
  }
}
