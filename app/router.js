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
        this.resource('programyearcompetencies', { path: 'competencies' });
        this.resource('programyearobjectives', { path: 'objectives' }, function(){
          this.resource('programyearobjectives.objective', { path: ':objective_id' });
          this.route('new');
        });
        this.resource('programyeardirectors', { path: 'directors' });
      });
    });
  });
});

export default Router;
