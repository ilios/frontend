import {
  create,
  collection,
  text,
} from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-school-vocabulary-manager]',
  title: text('[data-test-title]'),
  breadcrumbs: {
    scope: '[data-test-breadcrumbs]',
    all: text('[data-test-all]'),
    vocabulary: text('[data-test-vocabulary]'),
  },
  terms: {
    scope: '[data-test-terms]',
    list: collection('[data-test-term-list] [data-test-term]', {
      title: text(),
    }),
  },

};

export default definition;
export const component = create(definition);
