import LoginPage from '../pages/auth/login/login-page';
import RegisterPage from '../pages/auth/register/register-page';
import HomePage from '../pages/home/home-page';
import NewPage from '../pages/new/new-page';
import ReportDetailPage from '../pages/report-detail/report-detail-page';
import BookmarkPage from '../pages/bookmark/bookmark-page';
import NotFoundPage from '../pages/notfound/notfound-page';
import { checkAuthenticatedRoute, checkUnauthenticatedRouteOnly } from '../utils/auth';

export const routes = {
  '/': () => checkAuthenticatedRoute(new HomePage()),
  '/new': () => checkAuthenticatedRoute(new NewPage()),
  '/login': () => checkUnauthenticatedRouteOnly(new LoginPage()),
  '/register': () => checkUnauthenticatedRouteOnly(new RegisterPage()),
  '/report/:id': () => checkAuthenticatedRoute(new ReportDetailPage()),
  '/bookmark': () => checkAuthenticatedRoute(new BookmarkPage()),
  '/404': () => checkUnauthenticatedRouteOnly(new NotFoundPage()),
};
