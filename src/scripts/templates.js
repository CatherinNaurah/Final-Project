export function generateLoaderAbsoluteTemplate() {
  return `
    <div class="loader loader-absolute"></div>
  `;
}
export function generateUnauthenticatedNavigationListTemplate() {
  return `
    <li class="navigation-logo">
      <span class="logo-text">Dicoding Story</span>
    </li>
    <li><a id="login-button" href="#/login">Login</a></li>
    <li><a id="register-button" href="#/register">Register</a></li>
  `;
}

export function generateAuthenticatedNavigationListTemplate() {
  return `
    <li class="navigation-logo">
      <span class="logo-text">Dicoding Story</span>
    </li>
    <li id="push-notification-tools" class="push-notification-tools"></li>
    <li><a id="home" class="btn home-button" href="#/">Home <i class="fas fa-home"></i></a></li>
    <li><a id="bookmark-button" class="btn bookmark-button" href="#/bookmark">Bookmark <i class="fas fa-bookmark"></i></a></li>
    <li><a id="new-report-button" class="btn new-report-button" href="#/new">Buat Story <i class="fas fa-plus"></i></a></li>
    <li><a id="logout-button" class="logout-button" href="#/logout"><i class="fas fa-sign-out-alt"></i> Logout</a></li>
  `;
}

export function generateSubscribeButtonTemplate() {
  return `
    <button id="subscribe-button" class="btn subscribe-button">
      Subscribe <i class="fas fa-bell"></i>
    </button>
  `;
}

export function generateUnsubscribeButtonTemplate() {
  return `
    <button id="unsubscribe-button" class="btn unsubscribe-button">
      Unsubscribe <i class="fas fa-bell-slash"></i>
    </button>
  `;
}

export function generateReportItemTemplate({
  createdAt,
  description,
  id,
  lat,
  lon,
  name,
  photoUrl,
}) {
  return `
    <div class="report-item" id="report-${id}" tabindex="0" role="button" aria-label="Report ${name}">
      <img class="report-photo" src="${photoUrl}" alt="Report Photo">
      <div class="report-details">
        <h3 class="report-name">${name}</h3>
        <p class="report-description">${description}</p>
        <p class="report-location">Lat: ${lat}, Lon: ${lon}</p>
        <p class="report-date">Created At: ${new Date(createdAt).toLocaleString()}</p>
        
        <a href="/#/report/${id}" class="report-link">
          <button class="btn report-button" id="report-button-${id}" aria-label="Report ${name}">Lihat Selengkapnya</button>
        </a>
      </div>
    </div>
  `;
}

export function generateReportDetailTemplate({
  createdAt,
  description,
  id,
  lat,
  lon,
  name,
  photoUrl,
}) {
  return `
    <div class="" id="report-${id}" tabindex="0" role="button" aria-label="Report ${name}">
      <img class="" src="${photoUrl}" alt="Report Photo">
      <div class="">
        <h3 class="">${name}</h3>
        <p class="report-description">${description}</p>
        <p class="report-location">Lat: ${lat}, Lon: ${lon}</p>
        <p class="report-date">Created At: ${new Date(createdAt).toLocaleString()}</p>
      </div>
    </div>
  `;
}