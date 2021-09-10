import { clickable, create, collection } from 'ember-cli-page-object';
import listItem from './list-item';
import newProgramYear from './new';

const definition = {
  scope: '[data-test-program-year-list]',
  items: collection('[data-test-program-year-list-item]', listItem),
  newProgramYear,
  expandCollapse: {
    scope: '[data-test-expand-collapse-button]',
    toggle: clickable('button'),
  },
};

export default definition;
export const component = create(definition);
