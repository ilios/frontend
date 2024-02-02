import { collection, create } from 'ember-cli-page-object';

import listItem from './school-session-types-list-item';

const definition = {
  scope: '[data-test-school-session-types-list]',
  sessionTypes: collection('[data-test-school-session-types-list-item]', listItem),
};

export default definition;
export const component = create(definition);
