import { create, collection, isPresent, text } from 'ember-cli-page-object';

const definition = {
  headers: collection('thead th'),
  courses: collection('tbody tr', {
    title: text('[data-test-title]'),
    objectives: collection('[data-test-course-objective]'),
  }),
  hasNone: isPresent('[data-test-none]'),
};

export default definition;
export const component = create(definition);
