import { create, text } from 'ember-cli-page-object';

const definition = create({
  scope: '[data-test-course-visualizations]',
  title: text('[data-test-title]'),
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

export default definition;
export const component = create(definition);
