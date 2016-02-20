import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.route('dashboard', {
    resetNamespace: true
  });
  this.route('courses');
  this.route('course', {
    path: 'courses/:course_id',
    resetNamespace: true
  }, function(){
    this.route('publicationCheck', { path: '/publicationcheck'});
    this.route('publishall', { path: '/publishall'});
    this.route("session", {
      path: '/sessions/:session_id',
      resetNamespace: true
    }, function(){
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
  this.route('program', {
    path: 'programs/:program_id',
    resetNamespace: true
  }, function(){
    this.route('publicationCheck', { path: '/publicationcheck'});
    this.route("programYear", {
      path: '/programyears/:program-year_id',
      resetNamespace: true
    }, function(){
      this.route('publicationCheck', {path: '/publicationcheck'});
    });
  });
  this.route('admin-dashboard', { path: '/admin'});
  this.route('login');
  this.route('events', {path: 'events/:slug'});
  this.route('users', {});
  this.route('user', {path: '/users/:user_id'});
  this.route('fourOhFour', { path: "*path"});
  this.route('logout');
  this.route('pending-user-updates', {path: '/admin/userupdates'});
});

export default Router;
