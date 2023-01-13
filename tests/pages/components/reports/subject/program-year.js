import { attribute, create, collection, isPresent, text } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-reports-subject-program-year]',
  results: collection('[data-test-results] li', {
    title: text('[data-test-title]'),
    link: attribute('href', 'a'),
    hasLink: isPresent('a'),
    program: text('[data-test-program]'),
    hasSchool: isPresent('[data-test-school]'),
    school: text('[data-test-school]'),
  }),
};

export default definition;
export const component = create(definition);
