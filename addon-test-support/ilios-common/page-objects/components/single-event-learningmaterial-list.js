import { collection, create, property } from 'ember-cli-page-object';
import item from './single-event-learningmaterial-list-item';

const definition = {
  scope: '[data-test-single-event-learningmaterial-list]',
  items: collection('[data-test-single-event-learningmaterial-list-item]', item),
  prework: collection('[data-test-prework-event]', {
    url: property('href', 'a'),
  }),
};

export default definition;
export const component = create(definition);
