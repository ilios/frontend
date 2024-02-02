import { collection, create, hasClass, isPresent, property, text } from 'ember-cli-page-object';

import learningMaterials from './week-glance/learning-material-list';

import truncateText from './truncate-text';

const definition = {
  scope: '[data-test-week-glance-event]',
  title: text('[data-test-event-title]'),
  date: text('[data-test-date]'),
  sessionType: text('[data-test-session-type]'),
  location: text('[data-test-location]'),
  link: text('[data-test-url]'),
  url: property('href', '[data-test-url] a'),
  hasDescription: isPresent('[data-test-description]'),
  description: {
    scope: '[data-test-description]',
    content: truncateText,
  },
  sessionAttributes: collection('[data-test-session-attributes] svg', {
    attire: hasClass('fa-black-tie'),
    equipment: hasClass('fa-flask'),
    attendance: hasClass('fa-calendar-check'),
    supplemental: hasClass('fa-calendar-minus'),
  }),
  hasInstructors: isPresent('[data-test-instructors]'),
  instructors: text('[data-test-instructors]'),
  hasLearningMaterials: isPresent('[data-test-learning-materials]'),
  learningMaterials,
};

export default definition;
export const component = create(definition);
