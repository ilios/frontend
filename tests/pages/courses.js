import {
  clickable,
  create,
  collection,
  fillable,
  isHidden,
  isVisible,
  property,
  text,
  visitable,
} from 'ember-cli-page-object';
import { hasFocus } from 'ilios-common';

import courses from './components/ilios-course-list';
import newCourse from './components/new-course';

export default create({
  scope: '[data-test-courses]',
  visit: visitable('/courses'),
  filterByTitle: fillable('[data-test-title-filter]'),
  filterByYear: fillable('[data-test-year-filter]'),
  filterByMyCourses: clickable('[data-test-my-courses-filter] label:eq(0)'),
  yearFilters: collection('[data-test-year-filter] option', {
    text: text(),
    selected: property('selected'),
  }),
  schoolFilters: collection('[data-test-school-filter] option', {
    text: text(),
    selected: property('selected'),
  }),
  headerTitle: text('[data-test-courses-header-title]'),
  toggleNewCourseForm: clickable('[data-test-expand-collapse-button] button'),
  toggleNewCourseFormExists: isVisible('[data-test-expand-collapse-button]'),
  newCourse,
  newCourseLink: text('[data-test-newly-saved-course] a'),
  newCourseLinkIsHidden: isHidden('[data-test-newly-saved-course] a'),
  visitNewCourse: clickable('[data-test-newly-saved-course] a'),
  filterHasFocus: hasFocus('[data-test-title-filter]'),
  courses,
});
