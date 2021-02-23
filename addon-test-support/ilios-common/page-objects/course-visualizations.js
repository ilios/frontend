import { create, visitable } from 'ember-cli-page-object';

export default create({
  scope: '[data-test-course-visualizations]',
  visit: visitable('/data/courses/:courseId'),
  objectives: {
    scope: '[data-test-visualize-objectives]',
  },
  sessionTypes: {
    scope: '[data-test-visualize-session-types]',
  },
  vocabularies: {
    scope: '[data-test-visualize-vocabularies]',
  },
  instructors: {
    scope: '[data-test-visualize-instructors]',
  },
});
