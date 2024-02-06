import { attribute, collection, create, text } from 'ember-cli-page-object';

const definition = create({
  scope: '[data-test-course-visualizations]',
  title: text('[data-test-title]'),
  breadcrumb: {
    scope: '[data-test-breadcrumb]',
    crumbs: collection('span', {
      link: attribute('href', 'a'),
    }),
  },
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
