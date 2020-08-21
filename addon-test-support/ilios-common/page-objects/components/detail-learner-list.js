import { clickable, collection, create, isPresent } from 'ember-cli-page-object';
import userNameInfo from './user-name-info';

const definition = {
  scope: '[data-test-detail-learner-list]',
  learners: collection('li', {
    remove: clickable('[data-icon="times"]'),
    isRemovable: isPresent('[data-icon="times"]'),
    userNameInfo
  }),
};

export default definition;
export const component = create(definition);
