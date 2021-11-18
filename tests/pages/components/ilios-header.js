import { create, isPresent, text } from 'ember-cli-page-object';
import searchBox from 'ilios/tests/pages/components/global-search-box';

const definition = {
  scope: '[data-test-ilios-header]',
  hasTitle: isPresent('[data-test-title]'),
  title: text('[data-test-title]'),
  searchBox,
};

export default definition;
export const component = create(definition);
