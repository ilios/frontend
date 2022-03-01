export function dashboardRoutes(router) {
  router.route(
    'dashboard',
    {
      path: 'dashboard',
      resetNamespace: true,
    },
    function () {
      this.route('index');
      this.route('activities');
      this.route('materials');
      this.route('calendar');
    }
  );
  router.route('events', { path: 'events/:slug' });
  router.route('weeklyevents');
}

export function courseRoutes(router) {
  router.route(
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
  router.route('course-materials', { path: 'courses/:course_id/materials' });
  router.route('print_course', { path: 'course/:course_id/print' });
  router.route('course-visualizations', {
    path: 'data/courses/:course_id',
  });
  router.route('course-visualize-objectives', {
    path: 'data/courses/:course_id/objectives',
  });
  router.route('course-visualize-session-types', {
    path: 'data/courses/:course_id/session-types',
  });
  router.route('course-visualize-vocabularies', {
    path: 'data/courses/:course_id/vocabularies',
  });
  router.route('course-visualize-vocabulary', {
    path: 'data/courses/:course_id/vocabularies/:vocabulary_id',
  });
  router.route('course-visualize-term', {
    path: 'data/courses/:course_id/terms/:term_id',
  });
  /* eslint ember/routes-segments-snake-case: 0 */
  router.route('course-visualize-session-type', {
    path: 'data/courses/:course_id/session-types/:session-type_id',
  });
  router.route('course-visualize-instructors', {
    path: 'data/courses/:course_id/instructors',
  });
  router.route('course-visualize-instructor', {
    path: 'data/courses/:course_id/instructors/:user_id',
  });
}
