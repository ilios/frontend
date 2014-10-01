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
    this.resource('program', { path: ':program_id' }, function(){
      this.route('index');
      this.route('edit');
      this.route('newyear');
      this.resource('programyear', { path: 'year/:program_year_id' }, function(){
        this.route('index');
        this.route('managecompetencies', { path: 'managecompetencies' });
        this.route('manageobjectives', { path: 'manageobjectives' });
        this.route('managedirectors', { path: 'managedirectors' });
        this.route('managetopics', { path: 'managetopics' });
      });
    });
  });
});

export default Router;
