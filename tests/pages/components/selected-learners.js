import { clickable, collection, create, isPresent, text } from 'ember-cli-page-object';
import userNameInfo from './user-name-info';
import userStatus from './user-status';

const definition = {
  scope: '[data-test-selected-learners]',
  heading: text('[data-test-heading]'),
  learners: collection('li', {
    remove: clickable('button'),
    isRemovable: isPresent('button'),
    userStatus,
    userNameInfo,
  }),
  noLearners: {
    scope: '[data-test-no-selected-learners]',
  },
};

export default definition;
export const component = create(definition);
