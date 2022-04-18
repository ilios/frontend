import { inject as service } from '@ember/service';
import EmberRouter from '@ember/routing/router';
import config from 'ilios/config/environment';

export default class Router extends EmberRouter {
  @service iliosMetrics;
  @service router;
  location = config.locationType;
  rootURL = config.rootURL;

  constructor() {
    super(...arguments);
    this.on('routeDidChange', () => {
      const page = this.router.currentURL;
      const title = this.router.currentRouteName || 'unknown';

      this.iliosMetrics.track(page, title);
    });
  }
}

Router.map(function () {
  this.route(
    'dashboard',
    {
      resetNamespace: true,
    },
    function () {
      this.route('week');
      this.route('activities');
      this.route('materials');
      this.route('calendar');
    }
  );
  this.route('courses');
  this.route(
    'course',
    {
      path: 'courses/:course_id',
      resetNamespace: true,
    },
    function () {
      this.route('publication_check', { path: '/publicationcheck' });
      this.route('publishall');
      this.route('rollover');
      this.route(
        'session',
        {
          path: '/sessions/:session_id',
          resetNamespace: true,
        },
        function () {
          this.route('publication_check', { path: '/publicationcheck' });
          this.route('copy');
        }
      );
    }
  );
  this.route('print_course', { path: 'course/:course_id/print' });
  this.route('course-materials', { path: 'courses/:course_id/materials' });

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
        }
      );
    }
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
  this.route('course-rollover');
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
    }
  );
  this.route('curriculum-inventory-sequence-block', {
    path: 'curriculum-inventory-sequence-block/:curriculum_inventory_sequence_block_id',
  });
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
  this.route('session-type-visualize-vocabularies', {
    path: 'data/sessiontype/:session_type_id/vocabularies',
  });
  this.route('session-type-visualize-terms', {
    path: 'data/sessiontype/:session_type_id/vocabularies/:vocabulary_id',
  });
  this.route('weeklyevents');
  this.route('program-year-visualizations', {
    path: 'data/programyears/:program_year_id',
  });
  this.route('program-year-visualize-competencies', {
    path: 'data/programyears/:program_year_id/competencies',
  });
  this.route('search');
});
