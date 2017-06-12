import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('weeklyevents');
  this.route('login');
  this.route('events', {path: 'events/:slug'});
});

export default Router;
