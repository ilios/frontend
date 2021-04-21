import {
  attribute,
  create,
  clickable,
  collection,
  fillable,
  hasClass,
  text,
  visitable,
} from 'ember-cli-page-object';

import header from './components/instructorgroup-header';

export default create({
  visit: visitable('/instructorgroups/:instructorGroupId'),
  details: {
    scope: '.instructorgroup-details',
    header,
    list: collection('.instructorgroup-users li', {
      removable: hasClass('clickable'),
      remove: clickable(),
      name: text(),
    }),
  },

  search: {
    input: {
      scope: '.instructorgroup-overview input',
      fillInput: fillable(),
    },
    results: collection('.instructorgroup-overview .results [data-test-result]', {
      add: clickable(),
      text: text(),
    }),
  },

  instructors: collection('[data-test-instructors] li', {
    remove: clickable(),
    name: text(),
  }),

  associatedCourses: {
    scope: '.instructorgroupcourses',
    label: text('label'),
    list: collection('ul li', {
      link: attribute('href', 'a'),
      title: text(),
      visit: clickable('a'),
    }),
    text: text(),
  },
});
