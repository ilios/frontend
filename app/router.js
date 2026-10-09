import EmberRouter from '@embroider/router';
import config from 'frontend/config/environment';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function () {
  this.route(
    'dashboard',
    {
      resetNamespace: true,
    },
    function () {
      this.route('week');
      this.route('materials');
      this.route('calendar');
    },
  );
  this.route('events', { path: 'events/:slug' });
  this.route('weeklyevents');
  this.route('event-not-found', { path: 'event-not-found/:slug' });
  this.route('courses');
  this.route(
    'course',
    {
      path: 'courses/:course_id',
      resetNamespace: true,
    },
    function () {
      this.route('publication-check', { path: '/publicationcheck' });
      this.route('publishall');
      this.route('rollover');
      this.route(
        'session',
        {
          path: '/sessions/:session_id',
          resetNamespace: true,
        },
        function () {
          this.route('publication-check', { path: '/publicationcheck' });
          this.route('copy');
        },
      );
    },
  );
  this.route('course-materials', { path: 'courses/:course_id/materials' });
  this.route('print-course', { path: 'course/:course_id/print' });
  this.route('course-visualizations', {
    path: 'data/courses/:course_id',
  });
  this.route('course-visualize-objectives', {
    path: 'data/courses/:course_id/objectives',
  });
  this.route('course-visualize-session-types', {
    path: 'data/courses/:course_id/session-types',
  });
  this.route('course-visualize-vocabularies', {
    path: 'data/courses/:course_id/vocabularies',
  });
  this.route('course-visualize-vocabulary', {
    path: 'data/courses/:course_id/vocabularies/:vocabulary_id',
  });
  this.route('course-visualize-term', {
    path: 'data/courses/:course_id/terms/:term_id',
  });
  /* eslint ember/routes-segments-snake-case: 0 */
  this.route('course-visualize-session-type', {
    path: 'data/courses/:course_id/session-types/:session-type_id',
  });
  this.route('course-visualize-instructors', {
    path: 'data/courses/:course_id/instructors',
  });
  this.route('course-visualize-instructor', {
    path: 'data/courses/:course_id/instructors/:user_id',
  });
  this.route('instructor-groups', { path: 'instructorgroups' });
  this.route('instructor-group', { path: 'instructorgroups/:instructor_group_id' });

  this.route('programs');
  this.route('learner-group', { path: 'learnergroups/:learner_group_id' });
  this.route('learner-groups', { path: 'learnergroups' });
  this.route(
    'program',
    {
      path: 'programs/:program_id',
      resetNamespace: true,
    },
    function () {
      this.route('program-year', { path: '/programyears/:program_year_id', resetNamespace: true });
    },
  );
  this.route('admin-dashboard', { path: '/admin' });
  this.route('login');
  this.route('lti-login', { path: 'lti-login/:token' });
  this.route('users', {});
  this.route('user', { path: '/users/:user_id' });
  this.route('four-oh-four', { path: '*path' });
  this.route('logout');
  this.route('pending-user-updates', { path: '/admin/userupdates' });
  this.route('schools');
  this.route('school', { path: 'schools/:school_id' });
  this.route('assign-students', { path: '/admin/assignstudents' });
  this.route('myprofile');
  this.route('mymaterials');
  this.route('session-type-visualize-vocabularies', {
    path: 'data/sessiontype/:session_type_id/vocabularies',
  });
  this.route('session-type-visualize-vocabulary', {
    path: 'data/sessiontype/:session_type_id/vocabulary/:vocabulary_id',
  });
  this.route('program-year-visualize-objectives', {
    path: 'data/programyears/:program_year_id/objectives',
  });
  this.route('search');
  this.route('reports', function () {
    this.route('curriculum');
    this.route('subjects');
    this.route('subject', { path: 'subjects/:report_id' });
  });
});
