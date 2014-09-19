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
  this.resource('program', { path: '/program/:program_id' }, function(){
    this.route('edit');
    this.route('newyear');
    this.route('year', { path: 'year/:program_year_id' });
  });
});

export default Router;
