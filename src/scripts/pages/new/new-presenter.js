export default class NewPresenter {
  #view;
  #model;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  async postStory(payload) {
    try {
      await this.#model.postStory(payload);
    } catch (error) {
      console.error('getStories: error:', error);
    } finally {
    }
  }
}
