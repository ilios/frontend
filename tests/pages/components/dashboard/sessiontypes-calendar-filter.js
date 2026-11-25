import { collection, create } from 'ember-cli-page-object';

import c from './filter-checkbox';

const definition = {
  scope: '[data-test-session-types-calendar-filter]',
  sessionTypes: collection('[data-test-filter]', c),
};

export default definition;
export const component = create(definition);
