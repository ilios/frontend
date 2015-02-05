import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.resource('dashboard', function() {
    this.route('day');
    this.route('week');
    this.route('month');
    this.route('year');
  });
  this.resource('programs', function(){
    this.route('index');
    this.resource('programsschool', { path: 'school/:school_id'}, function(){
      this.route('index');
      this.route('new');
      this.resource('program', { path: 'program/:program_id' }, function(){
        this.route('index');
        this.route('edit');
        this.resource('programyear', { path: 'years/:program_year_id' }, function(){
          this.route('index');
          this.route('managecompetencies');
          this.route('manageobjectives');
          this.route('managedirectors');
          this.route('managetopics');
          this.route('managestewardingschools');
        });
      });
    });
  });
  this.resource('instructorgroups', function(){
    this.route('index');
    this.resource('instructorgroupsschool', { path: 'school/:school_id'}, function(){
      this.route('index');
    });
  });
  this.resource('learnergroups', function(){
    this.route('index');
    this.resource('learnergroupsschool', { path: 'school/:school_id'}, function(){
      this.route('index');
      this.resource('learnergroupscohort', { path: 'cohort/:cohort_id'}, function(){
        this.route('index');
      });
    });
  });
  this.route('courses');
  this.route('course', { path: 'course/:course_id'});
  this.route("courseobjective", {path: 'course/:course_id/objective/:objective_id'});
  this.route("loading");

  this.route("testmodels");
});

export default Router;
