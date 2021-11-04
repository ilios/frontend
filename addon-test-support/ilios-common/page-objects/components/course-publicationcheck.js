import { create, text } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-course-publicationcheck]',
  title: text('[data-test-title]'),
  courseTitle: text('[data-test-course-title]'),
  cohorts: text('[data-test-cohorts]'),
  terms: text('[data-test-terms]'),
  objectives: text('[data-test-objectives]'),
  unlink: {
    scope: '[data-test-unlink]',
  },
  mesh: text('[data-test-mesh]'),
};

export default definition;
export const component = create(definition);
