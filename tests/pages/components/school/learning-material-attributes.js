import { create } from 'ember-cli-page-object';
import collapsed from './learning-material-attributes-collapsed';
import expanded from './learning-material-attributes-expanded';

const definition = {
  scope: '[data-test-school-learning-material-attributes]',
  collapsed,
  expanded,
};

export default definition;
export const component = create(definition);
