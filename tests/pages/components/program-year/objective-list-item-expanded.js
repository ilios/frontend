import {
  create,
  collection,
  isPresent,
  text,
} from 'ember-cli-page-object';

const definition = {
  headers: collection('[data-test-program-year-objective-list-item-expanded-heading] td'),
  courses: collection('[data-test-program-year-objective-list-item-expanded-course]', {
    title: text('[data-test-title]'),
    objectives: collection('[data-test-course-objective]'),
  }),
  hasNone: isPresent('[data-test-none]'),
};

export default definition;
export const component = create(definition);
