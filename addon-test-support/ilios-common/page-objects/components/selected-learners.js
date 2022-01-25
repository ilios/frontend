import { clickable, collection, create, isPresent, text } from 'ember-cli-page-object';
import userNameInfo from './user-name-info';

const definition = {
  scope: '[data-test-selected-learners]',
  heading: text('[data-test-heading]'),
  learners: collection('li', {
    remove: clickable('button'),
    isRemovable: isPresent('button'),
    userNameInfo,
  }),
  noLearners: {
    scope: '[data-test-no-selected-learners]',
  },
};

export default definition;
export const component = create(definition);
