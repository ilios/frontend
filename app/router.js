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
        this.resource('programyearobjectives', { path: 'objectives' });
        this.resource('programyeardirectors', { path: 'directors' });
        this.resource('programyeartopics', { path: 'topics' });
      });
    });
  });
});

export default Router;
