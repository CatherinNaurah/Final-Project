import LoginPresenter from './login-presenter';
import * as MyAPI from '../../../data/api'; // ganti ini sesuai nama API kamu
import * as AuthModel from '../../../utils/auth';

export default class LoginPage {
  #presenter = null;

  async render() {
    return `
      <section class="page-center">
  <div class="login-container">
    <article class="login-form-container">
      <h1 class="login__title">Masuk akun</h1>

      <form id="login-form" class="login-form">
        <div class="form-control">
          <label for="email-input">Email</label>
          <input id="email-input" type="email" name="email" placeholder="Contoh: nama@email.com" required>
        </div>
        <div class="form-control">
          <label for="password-input">Password</label>
          <input id="password-input" type="password" name="password" placeholder="Masukkan password Anda" required>
        </div>
        <div id="submit-button-container">
          <button class="btn" type="submit">Masuk</button>
        </div>
        <p class="login-form__do-not-have-account">
          Belum punya akun? <a href="#/register">Daftar</a>
        </p>
      </form>
    </article>
  </div>
</section>
    `;
  }

  async afterRender() {
    this.#presenter = new LoginPresenter({
      view: this,
      model: MyAPI,
      authModel: AuthModel,
    });

    this.#setupForm();
  }

  #setupForm() {
    document.getElementById('login-form').addEventListener('submit', async (event) => {
      event.preventDefault();

      const data = {
        email: document.getElementById('email-input').value,
        password: document.getElementById('password-input').value,
      };

      await this.#presenter.getLogin(data);
    });
  }

  loginSuccessfully(message) {
    console.log(message);
    location.hash = '/';
  }

  loginFailed(message) {
    alert(message);
  }

  showSubmitLoadingButton() {
    document.getElementById('submit-button-container').innerHTML = `
      <button class="btn" type="submit" disabled>
        <i class="fas fa-spinner loader-button"></i> Masuk
      </button>
    `;
  }

  hideSubmitLoadingButton() {
    document.getElementById('submit-button-container').innerHTML = `
      <button class="btn" type="submit">Masuk</button>
    `;
  }
}
