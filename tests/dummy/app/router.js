import EmberRouter from '@ember/routing/router';
import config from './config/environment';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function() {
  this.route('dashboard');
  this.route('login');
  this.route('events', {path: 'events/:slug'});
  this.route('logout');
  this.route('weeklyevents');
  this.route('courses');
  this.route('course', {
    path: 'courses/:course_id',
    resetNamespace: true
  }, function(){
    this.route('publication_check', { path: '/publicationcheck'});
    this.route('publishall');
    this.route('rollover');
    this.route("session", {
      path: '/sessions/:session_id',
      resetNamespace: true
    }, function(){
      this.route('publication_check', {path: '/publicationcheck'});
      this.route('copy');
    });
  });
  this.route('course-materials', { path: 'courses/:course_id/materials'});
  this.route('print_course', { path: 'course/:course_id/print'});
  this.route('course-visualizations', {
    path: 'data/courses/:course_id'
  });
  this.route('course-visualize-objectives', {
    path: 'data/courses/:course_id/objectives'
  });
  this.route('course-visualize-session-types', {
    path: 'data/courses/:course_id/session-types'
  });
  this.route('course-visualize-vocabularies', {
    path: 'data/courses/:course_id/vocabularies'
  });
  this.route('course-visualize-vocabulary', {
    path: 'data/courses/:course_id/vocabularies/:vocabulary_id'
  });
  this.route('course-visualize-term', {
    path: 'data/courses/:course_id/terms/:term_id'
  });
  /* eslint ember/routes-segments-snake-case: 0 */
  this.route('course-visualize-session-type', {
    path: 'data/courses/:course_id/session-types/:session-type_id'
  });
  this.route('course-visualize-instructors', {
    path: 'data/courses/:course_id/instructors'
  });
  this.route('course-visualize-instructor', {
    path: 'data/courses/:course_id/instructors/:user_id'
  });
  this.route('mymaterials');
});
