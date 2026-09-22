import { create, fillable, collection, attribute, isPresent, text } from 'ember-cli-page-object';

const definition = {
  filterByTitle: fillable('[data-test-subject-results]'),
  description: text('[data-test-report-description]'),
  results: collection('[data-test-results] li', {
    link: attribute('href', 'a'),
    hasLink: isPresent('a'),
  }),
};

export default definition;
export const component = create(definition);
