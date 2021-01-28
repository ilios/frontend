import {
  clickable,
  create,
  collection,
  fillable,
  isHidden,
  isVisible,
  property,
  text,
  visitable
} from 'ember-cli-page-object';

import courses from './components/ilios-course-list';

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
  toggleNewCourseForm: clickable('[data-test-expand-collapse-button] button'),
  toggleNewCourseFormExists: isVisible('[data-test-expand-collapse-button]'),
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
  newCourseLinkIsHidden: isHidden('[data-test-new-course] a'),
  visitNewCourse: clickable('[data-test-new-course] a'),
  courses,
});
