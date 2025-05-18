export default class NotFoundPage {
  async render() {
    return `
      <section class="notfound-page">
        <h1 class="section-title">404 - Page Not Found</h1>
      </section>
    `;
  }

  async afterRender() {
  }
}
