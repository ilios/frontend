import { create, text } from 'ember-cli-page-object';
import searchBox from 'ilios/tests/pages/components/global-search-box';

const definition = {
  scope: '[data-test-ilios-header]',
  title: text('[data-test-title]'),
  searchBox,
};

export default definition;
export const component = create(definition);
