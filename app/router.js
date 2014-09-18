import Ember from 'ember';

var Router = Ember.Router.extend({
  location: IliosENV.locationType
});

Router.map(function() {
  this.resource('dashboard', function() {
    this.route('day');
    this.route('week');
    this.route('month');
    this.route('year');
  });
  this.resource('programs', function(){
    this.route('new');
  });
  this.route('program', { path: '/program/:program_id' });
  this.route('program-year', { path: '/program-year/:program-year_id' });
});

export default Router;
