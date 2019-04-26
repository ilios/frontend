import {
  attribute,
  create,
  clickable,
  collection,
  fillable,
  hasClass,
  text,
  value,
  visitable
} from 'ember-cli-page-object';

export default create({
  visit: visitable('/instructorgroups/:instructorGroupId'),

  header: {
    scope: '.instructorgroup-header',
    title: text('.title'),
    schoolTitle: text('.school-title'),
    groupTitle: {
      scope: '[data-test-group-title]',
      text: text(),
      edit: clickable('.clickable'),
      fillInput: fillable('input'),
      inputValue: value('input'),
      save: clickable('.actions .done'),
    },
    membersInfo: text('.info'),
  },

  details: {
    scope: '.instructorgroup-details',
    title: text('h2'),
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
  }
});
