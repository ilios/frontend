import EmberRouter from '@ember/routing/router';
import config from 'dummy/config/environment';
import { courseRoutes, dashboardRoutes } from 'ilios-common/common-routes';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function () {
  dashboardRoutes(this);
  courseRoutes(this);
  this.route('login');
  this.route('logout');
});
