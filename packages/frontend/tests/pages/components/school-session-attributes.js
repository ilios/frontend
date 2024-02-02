import { create } from 'ember-cli-page-object';
import collapsed from './school-session-attributes-collapsed';
import expanded from './school-session-attributes-expanded';

const definition = {
  scope: '[data-test-school-session-attributes]',
  collapsed,
  expanded,
};

export default definition;
export const component = create(definition);
