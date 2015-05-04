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
  this.resource('course', { path: 'course/:course_id'}, function(){
    this.route("session", {path: '/session/:session_id'});
    this.route('sessionpublicationcheck', {path: '/session/:session_id/publicationcheck'});
  });
  this.route('print-course', { path: 'course/:course_id/print'});
  this.route('course-publicationcheck', { path: 'course/:course_id/publicationcheck'});

  this.route('instructorgroups');
  this.route('instructorgroup', { path: 'instructorgroup/:instructor_group_id'});

  this.route("testmodels");
  this.route("loading");
  this.route('programs');
  this.route('learnergroup', { path: 'learnergroup/:learner_group_id'});
  this.route('learnergroups');
  this.resource('program', { path: 'program/:program_id'}, function(){
    this.route("programyear", {path: '/programyear/:program-year_id'});
    this.route('publicationcheck');
  });
});

export default Router;
