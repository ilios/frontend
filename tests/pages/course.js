import {
  clickable,
  create,
  collection,
  count,
  fillable,
  hasClass,
  property,
  text,
  visitable
} from 'ember-cli-page-object';

export default create({
  scope: '[data-test-ilios-course-details]',
  visit: visitable('/courses/:courseId'),

  objectives: {
    scope: '[data-test-detail-objectives]',
    current: collection({
      scope: 'table',
      itemScope: 'tbody tr',
      item: {
        title: text('td', { at: 0 }),
        parents: collection({
          scope: 'td',
          itemScope: '[data-test-parent]',
          item: {
            title: text(),
          },
        }, { at: 1 }),
      },
    }),
  },


  cohorts: {
    scope: '[data-test-detail-cohorts]',
    manage: clickable('.actions button'),
    save: clickable('.actions button.bigadd'),
    cancel: clickable('.actions button.bigcancel'),
    current: collection({
      scope: 'table',
      itemScope: 'tbody tr',
      item: {
        school: text('td', { at: 0 }),
        program: text('td', { at: 1 }),
        cohort: text('td', { at: 2 }),
        level: text('td', { at: 3 }),
      },
    }),
    selected: collection({
      scope: '.selected-cohorts',
      itemScope: 'li',
      item: {
        name: text(),
        remove: clickable(),
      },
    }),
    selectable: collection({
      scope: '.selectable-cohorts',
      itemScope: 'li',
      item: {
        name: text(),
        add: clickable(),
      },
    }),
  },

});
