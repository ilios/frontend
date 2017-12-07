import EmberRouter from '@ember/routing/router';
import config from './config/environment';

const Router = EmberRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('login', { path: 'login/:token'});
  this.route('login-error');
  this.route('weeklyevents');
  this.route('events', {path: 'events/:slug'});
});

export default Router;
