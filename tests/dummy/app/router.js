import EmberRouter from '@ember/routing/router';
import config from './config/environment';

const Router = EmberRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('login');
  this.route('events', {path: 'events/:slug'});
  this.route('logout');
  this.route('weeklyevents');
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
  this.route('course-materials', { path: 'courses/:course_id/materials'});
  this.route('printCourse', { path: 'course/:course_id/print'});
  this.route('course-visualizations', {
    path: 'data/courses/:course_id'
  });
  this.route('course-visualize-objectives', {
    path: 'data/courses/:course_id/objectives'
  });
});

export default Router;
