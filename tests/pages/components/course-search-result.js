import {
  clickable,
  collection,
  create,
  isHidden,
  isVisible,
  text
} from 'ember-cli-page-object';

const definition = {
  schoolTitle: text('[data-test-school-title]'),
  courseTitle: text('[data-test-course-title]'),
  clickCourse: clickable('[data-test-course-title]'),
  sessions: collection('.session-title-link'),
  showMoreIsVisible: isVisible('.show-more'),
  showMoreIsHidden: isHidden('.show-more'),
  showMore: clickable('.show-more')
};

export default definition;
export const component = create(definition);
