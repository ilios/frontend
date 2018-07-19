import {
  clickable,
  create,
  collection,
  count,
  fillable,
  hasClass,
  isVisible,
  property,
  text,
  visitable
} from 'ember-cli-page-object';

export default create({
  scope: '[data-test-courses]',
  visit: visitable('/courses'),
  filterByTitle: fillable('[data-test-title-filter]'),
  filterByYear: fillable('[data-test-year-filter]'),
  filterByMyCourses: clickable('[data-test-my-courses-filter] label:eq(0)'),
  yearFilters: collection({
    itemScope: '[data-test-year-filter] option',
    item: {
      text: text(),
      selected: property('selected'),
    },
  }),
  schoolFilters: collection({
    itemScope: '[data-test-school-filter] option',
    item: {
      text: text(),
      selected: property('selected'),
    },
  }),
  headerTitle: text('[data-test-courses-header-title]'),
  toggleNewCourseForm: clickable('[data-test-toggle-new-course-form]'),
  toggleNewCourseFormExists: isVisible('[data-test-toggle-new-course-form]'),
  newCourseForm: {
    scope: '[data-test-new-course]',
    title: fillable('[data-test-title]'),
    chooseYear: fillable('[data-test-year]'),
    save: clickable('.done'),
    years: collection({
      itemScope: '[data-test-year] option',
      item: {
        text: text(),
        selected: property('selected'),
      },
    }),
  },
  newCourseLink: text('[data-test-new-course] a'),
  savedCoursesCount: count('[data-test-new-course] a'),
  visitNewCourse: clickable('[data-test-new-course] a'),
  courses: collection({
    scope: '[data-test-ilios-course-list]',
    itemScope: '[data-test-courses] tr',

    item: {
      title: text('td', { at: 0 }),
      school: text('td', { at: 1 }),
      year: text('td', { at: 2 }),
      level: text('td', { at: 3 }),
      startDate: text('td', { at: 4 }),
      endDate: text('td', { at: 5 }),
      status: text('td', { at: 6 }),
      isLocked: hasClass('fa-lock', 'i', {scope: 'td:eq(6)'}),
      isUnlocked: hasClass('fa-unlock', 'i', {scope: 'td:eq(6)'}),
      lock: clickable('.fa-unlock', {scope: 'td:eq(6)'}),
      unLock: clickable('.fa-lock', {scope: 'td:eq(6)'}),
      remove: clickable('.remove', {scope: 'td:eq(6)'}),
      removeActionCount: count('.remove', {scope: 'td:eq(6)'}),
    },
  }),
  sortByTitle: clickable('th', {scope: '[data-test-ilios-course-list] [data-test-course-headings]', at: 0}),
  sortByLevel: clickable('th', {scope: '[data-test-ilios-course-list] [data-test-course-headings]', at: 3}),
  sortByStartDate: clickable('th', {scope: '[data-test-ilios-course-list] [data-test-course-headings]', at: 4}),
  sortByEndDate: clickable('th', {scope: '[data-test-ilios-course-list] [data-test-course-headings]', at: 5}),
  sortByStatus: clickable('th', {scope: '[data-test-ilios-course-list] [data-test-course-headings]', at: 6}),
  confirmCourseRemoval: clickable('[data-test-courses] .confirm-removal button.remove'),
});
