import {clickable, collection, create, text} from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-detail-learner-list]',
  learners: collection('li', {
    userName: text('[data-test-user-name]'),
    remove: clickable('[data-icon="times"]'),
  }),
};

export default definition;
export const component = create(definition);
