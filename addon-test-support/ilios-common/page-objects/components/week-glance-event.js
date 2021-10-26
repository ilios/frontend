import {
  attribute,
  collection,
  create,
  hasClass,
  isPresent,
  property,
  text,
} from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-week-glance-event]',
  title: text('[data-test-event-title]'),
  date: text('[data-test-date]'),
  sessionType: text('[data-test-session-type]'),
  location: text('[data-test-location]'),
  link: text('[data-test-url]'),
  url: property('href', '[data-test-url] a'),
  hasDescription: isPresent('[data-test-description]'),
  description: text('[data-test-description]'),
  sessionAttributes: collection('[data-test-session-attributes] svg', {
    attire: hasClass('fa-black-tie'),
    equipment: hasClass('fa-flask'),
    attendance: hasClass('fa-calendar-check'),
    supplemental: hasClass('fa-calendar-minus'),
  }),
  hasInstructors: isPresent('[data-test-instructors]'),
  instructors: text('[data-test-instructors]'),
  hasLearningMaterials: isPresent('[data-test-learning-materials]'),
  learningMaterials: collection('[data-test-learning-materials] [data-test-learning-material]', {
    title: text('[data-test-material-title]'),
    hasTypeIcon: isPresent('[data-test-lm-type-icon] svg'),
    typeIconTitle: text('[data-test-lm-type-icon]'),
    hasPublicNotes: isPresent('[data-test-public-notes]'),
    publicNotes: text('[data-test-public-notes]'),
    hasCitation: isPresent('[data-test-citation]'),
    citation: text('[data-test-citation]'),
    url: attribute('href', '[data-test-material-title]'),
    timedReleaseInfo: text('[data-test-time-release-info]'),
  }),
  preWork: collection('[data-test-pre-work] li', {
    title: text(),
    hasLink: isPresent('a'),
  }),
};

export default definition;
export const component = create(definition);
