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
      const response = await this.#model.getAllStories();
      response.listStory.forEach(story => {
        this.#db.putAllReports(story);
      });
      this.#view.renderStories(response.listStory)
      await this.#view.initialMap();
    } catch (error) {
      const isDataExist = await this.#db.getAllReports();
      if (isDataExist.length > 0) {
        this.#view.renderStories(isDataExist);
      }
      console.error('getStories: error:', error);
    } finally {
    }
  }
}
