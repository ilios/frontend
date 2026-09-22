import { collection, create } from 'ember-cli-page-object';
import ListItem from './taxonomy-manager-terms-list-item';

const definition = {
  scope: "[data-test-taxonomy-manager-terms-list-level='0']",
  items: collection("[data-test-taxonomy-manager-terms-list-item-level='0']", ListItem),
  lists: collection("[data-test-taxonomy-manager-terms-list-level='1']", {
    items: collection("[data-test-taxonomy-manager-terms-list-item-level='1']", ListItem),
  }),
};

export default definition;
export const component = create(definition);
