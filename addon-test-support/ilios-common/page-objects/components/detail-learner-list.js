import { clickable, collection, create, isPresent } from 'ember-cli-page-object';
import userNameInfo from './user-name-info';

const definition = {
  scope: '[data-test-detail-learner-list]',
  learners: collection('li', {
    remove: clickable('button'),
    isRemovable: isPresent('button'),
    userNameInfo,
  }),
};

export default definition;
export const component = create(definition);
