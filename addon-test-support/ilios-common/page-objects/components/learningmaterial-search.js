import {
  clickable,
  collection,
  create,
  fillable,
  isVisible,
  text,
} from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-learningmaterial-search]',
  search: fillable('[data-test-search-box] input'),
  searchResults: collection('.lm-search-results > li', {
    title: text('[data-test-title]'),
    description: text('learning-material-description'),
    hasFileIcon: isVisible('.fa-file'),
    properties: collection('.learning-material-properties li', {
      value: text(),
    }),
    add: clickable(),
  }),
};

export default definition;
export const component = create(definition);
