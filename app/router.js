import EmberRouter from '@ember/routing/router';
import config from 'lti-app/config/environment';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function () {
  this.route('login', { path: 'login/:token' });
  this.route('login-error');
  this.route('weeklyevents');
  this.route('events', { path: 'events/:slug' });
  this.route(
    'dashboard',
    {
      resetNamespace: true,
    },
    function () {
      this.route('week');
      this.route('activities');
      this.route('materials');
      this.route('calendar');
    }
  );
});
