import { create, text } from 'ember-cli-page-object';
import searchBox from 'frontend/tests/pages/components/global-search-box';
import userMenu from 'frontend/tests/pages/components/user-menu';

const definition = {
  scope: '[data-test-ilios-header]',
  title: text('[data-test-title]'),
  searchBox,
  userMenu,
};

export default definition;
export const component = create(definition);
