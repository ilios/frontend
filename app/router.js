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
  this.route('courses');
  this.resource('course', { path: 'courses/:course_id'}, function(){
    this.route('publicationCheck', { path: '/publicationcheck'});
    this.resource("session", {path: '/sessions/:session_id'}, function(){
      this.route('publicationCheck', {path: '/publicationcheck'});
    });
  });
  this.route('printCourse', { path: 'course/:course_id/print'});

  this.route('instructorGroups', { path: 'instructorgroups'});
  this.route('instructorGroup', { path: 'instructorgroups/:instructor_group_id'});

  this.route("testModels");
  this.route("loading");
  this.route('programs');
  this.route('learnerGroup', { path: 'learnergroups/:learner_group_id'});
  this.route('learnerGroups', { path: 'learnergroups'});
  this.resource('program', { path: 'programs/:program_id'}, function(){
    this.route('publicationCheck', { path: '/publicationcheck'});
    this.resource("programYear", {path: '/programyears/:program-year_id'}, function(){
      this.route('publicationCheck', {path: '/publicationcheck'});
    });
  });
});

export default Router;
