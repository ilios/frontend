import { collection, create, property, text } from 'ember-cli-page-object';
import item from './single-event-learningmaterial-list-item';

const definition = {
  scope: '[data-test-single-event-learningmaterial-list]',
  items: collection('[data-test-single-event-learningmaterial-list-item]', item),
  prework: collection('[data-test-prework-event]', {
    url: property('href', 'a'),
    name: text('[data-test-name]'),
    items: collection('[data-test-single-event-learningmaterial-list-item]', item),
  }),
  noContent: {
    scope: '[data-test-no-content]',
  },
};

export default definition;
export const component = create(definition);
