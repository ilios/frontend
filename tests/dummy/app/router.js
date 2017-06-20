import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('login');
  this.route('events', {path: 'events/:slug'});
  this.route('logout');
  this.route('weeklyevents');
});

export default Router;
