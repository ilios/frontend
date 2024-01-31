import { attribute, create, collection, isPresent, text } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-reports-subject-program]',
  results: collection('[data-test-results] li', {
    title: text('[data-test-title]'),
    link: attribute('href', 'a'),
    hasLink: isPresent('a'),
    hasSchool: isPresent('[data-test-school]'),
    school: text('[data-test-school]'),
  }),
};

export default definition;
export const component = create(definition);
