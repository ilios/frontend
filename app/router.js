import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType,
  rootURL: config.rootURL
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
    this.route('rollover', { path: '/rollover'});
    this.route("session", {
      path: '/sessions/:session_id',
      resetNamespace: true
    }, function(){
      this.route('publicationCheck', {path: '/publicationcheck'});
      this.route('copy');
    });
  });
  this.route('printCourse', { path: 'course/:course_id/print'});
  this.route('course-materials', { path: 'courses/:course_id/materials'});

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
  this.route('schools');
  this.route('school', { path: 'schools/:school_id'});
  this.route('assign-students', {path: '/admin/assignstudents'});
  this.route('myprofile');
  this.route('course-rollover');
  this.route('curriculumInventoryReports', {
    path: 'curriculum-inventory-reports'
  });
  this.route('curriculumInventoryReport', {
    path: 'curriculum-inventory-reports/:curriculum_inventory_report_id',
    resetNamespace: true
  }, function() {
    this.route('rollover', { path: '/rollover'});
  });
  this.route('curriculumInventorySequenceBlock', {
    path: 'curriculum-inventory-sequence-block/:curriculum_inventory_sequence_block_id'
  });
});

export default Router;
