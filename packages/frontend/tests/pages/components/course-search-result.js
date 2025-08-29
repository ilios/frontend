import { clickable, collection, create, isHidden, isVisible, text } from 'ember-cli-page-object';

const definition = {
  schoolTitle: text('[data-test-school-title]'),
  courseTitle: text('[data-test-course-title]'),
  clickCourse: clickable('[data-test-course-title]'),
  sessions: collection('.session-title-link'),
  showLess: clickable('.show-less'),
  showLessIsHidden: isHidden('.show-less'),
  showLessIsVisible: isVisible('.show-less'),
  showMore: clickable('.show-more'),
  showMoreIsHidden: isHidden('.show-more'),
  showMoreIsVisible: isVisible('.show-more'),
};

export default definition;
export const component = create(definition);
