import { collection, create, text } from 'ember-cli-page-object';
import learnergroupTree from './learnergroup-tree';

const definition = {
  scope: '[data-test-learnergroup-selection-cohort-manager]',
  title: text('[data-test-title-cohort-title]'),
  trees: collection('[data-test-learnergroup-tree-root=true]', learnergroupTree),
};

export default definition;
export const component = create(definition);
