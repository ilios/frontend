import EmberRouter from '@ember/routing/router';
import config from 'frontend/config/environment';
import { courseRoutes, dashboardRoutes } from 'ilios-common/common-routes';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function () {
  dashboardRoutes(this);
  this.route('courses');
  courseRoutes(this);
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
      this.route('publication-check', { path: '/publicationcheck' });
      this.route(
        'program-year',
        {
          path: '/programyears/:program_year_id',
          resetNamespace: true,
        },
        function () {
          this.route('publication-check', { path: '/publicationcheck' });
        },
      );
    },
  );
  this.route('admin-dashboard', { path: '/admin' });
  this.route('login');
  this.route('events', { path: 'events/:slug' });
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
  this.route('verification-preview', {
    path: 'curriculum-inventory-reports/:curriculum_inventory_report_id/verification-preview',
  });
  this.route('curriculum-inventory-reports');
  this.route(
    'curriculum-inventory-report',
    {
      path: 'curriculum-inventory-reports/:curriculum_inventory_report_id',
    },
    function () {
      this.route('rollover');
    },
  );
  this.route('curriculum-inventory-sequence-block', {
    path: 'curriculum-inventory-sequence-block/:curriculum_inventory_sequence_block_id',
  });
  this.route('session-type-visualize-vocabularies', {
    path: 'data/sessiontype/:session_type_id/vocabularies',
  });
  this.route('session-type-visualize-vocabulary', {
    path: 'data/sessiontype/:session_type_id/vocabulary/:vocabulary_id',
  });
  this.route('weeklyevents');
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
