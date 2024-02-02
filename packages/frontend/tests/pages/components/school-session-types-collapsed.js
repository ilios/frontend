import { clickable, create, text } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-school-session-types-collapsed]',
  expand: clickable('[data-test-expand]'),
  assessmentCount: text('[data-test-assessment-count]'),
  instructionalCount: text('[data-test-instructional-count]'),
};

export default definition;
export const component = create(definition);
