import { routes } from "../routes/routes";
import { getActiveRoute } from "../routes/url-parser";
import {
  generateUnauthenticatedNavigationListTemplate,
  generateAuthenticatedNavigationListTemplate,
  generateSubscribeButtonTemplate,
  generateUnsubscribeButtonTemplate,
} from "../templates";
import { isServiceWorkerAvailable, transitionHelper } from "../utils";
import { getAccessToken, getLogout } from '../utils/auth';
import {
  isCurrentPushSubscriptionAvailable,
  subscribe,
  unsubscribe,
} from '../utils/notification-helper';

export default class App {
  #content;
  #navbar;

  constructor({ content, navbar }) {
    this.#content = content;
    this.#navbar = navbar
  }

  async renderPage() {
    const url = getActiveRoute()
    const route = routes[url]

    if (!route) {
      location.hash = '/404';
      return;
    }

    const page = route()

    const transition = transitionHelper({
      updateDOM: async () => {
        this.#content.innerHTML = await page.render();
        page.afterRender();
      },
    });

    transition.ready.catch(console.error);
    transition.updateCallbackDone.then(() => {
      scrollTo({ top: 0, behavior: 'instant' });
      this.setupNavigationList();
    });
  }

  setupNavigationList() {
    const isLogin = !!getAccessToken();
    const navList = this.#navbar.children.namedItem('navlist');

    // User not log in
    if (!isLogin) {
      navList.innerHTML = generateUnauthenticatedNavigationListTemplate();
      return;
    }

    navList.innerHTML = generateAuthenticatedNavigationListTemplate();

    const logoutButton = document.getElementById('logout-button');
    logoutButton.addEventListener('click', (event) => {
      event.preventDefault();

      if (confirm('Apakah Anda yakin ingin keluar?')) {
        getLogout();

        // Redirect
        location.hash = '/login';
      }
    });

    if (isServiceWorkerAvailable()) {
      this.setupPushNotification();
    }
  }

  async setupPushNotification() {
    const pushNotificationTools = document.getElementById('push-notification-tools');
    const isSubscribed = await isCurrentPushSubscriptionAvailable();

    if (isSubscribed) {
      pushNotificationTools.innerHTML = await generateUnsubscribeButtonTemplate();
      const unsubscribeButton = document.getElementById('unsubscribe-button');
      if (!unsubscribeButton) {
        return;
      }
      unsubscribeButton.addEventListener('click', () => {
        unsubscribe().finally(() => {
          this.setupPushNotification();
        });
      });

      return;
    }

    pushNotificationTools.innerHTML = await generateSubscribeButtonTemplate();
    const subscribeButton = document.getElementById('subscribe-button');
    if (!subscribeButton) {
      return;
    }
    subscribeButton.addEventListener('click', () => {
      subscribe().finally(() => {
        this.setupPushNotification();
      });
    });
  }
}
