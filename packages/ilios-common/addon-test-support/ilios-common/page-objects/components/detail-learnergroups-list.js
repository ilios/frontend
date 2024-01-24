import { collection, create, isHidden, text } from 'ember-cli-page-object';
import item from './detail-learnergroups-list-item';

const definition = {
  scope: '[data-test-detail-learnergroups-list]',
  isEmpty: isHidden('[data-test-trees]'),
  trees: collection('[data-test-tree]', {
    title: text('legend'),
    items: collection(item.scope, item),
  }),
};

export default definition;
export const component = create(definition);
