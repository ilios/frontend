import { create, text } from 'ember-cli-page-object';
import searchBox from './global-search-box';
import userMenu from './user-menu';

const definition = {
  scope: '[data-test-ilios-header]',
  title: text('[data-test-title]'),
  searchBox,
  userMenu,
};

export default definition;
export const component = create(definition);
