import { attribute, clickable, create, property, text } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-course-publicationcheck]',
  backToCourse: {
    scope: '[data-test-back-to-course]',
    url: attribute('href'),
  },
  title: text('[data-test-title]'),
  missingItemsTitle: text('[data-test-missing-items]'),
  courseTitle: text('[data-test-course-title]'),
  cohorts: text('[data-test-cohorts]'),
  terms: text('[data-test-terms]'),
  objectives: text('[data-test-objectives]'),
  unlink: {
    scope: '[data-test-unlink]',
  },
  publish: {
    scope: '[data-test-publish]',
    text: text(),
    click: clickable(),
  },
  publishMissingRequirements: {
    scope: '[data-test-publish-missing-requirements]',
    text: text(),
    isDisabled: property('disabled'),
    click: clickable(),
  },
  publishWithMissingItems: {
    scope: '[data-test-publish-with-missing-items]',
    text: text(),
    click: clickable(),
  },
};

export default definition;
export const component = create(definition);
