import { clickable, collection, create, isPresent, text } from 'ember-cli-page-object';
import userNameInfo from './user-name-info';

const definition = {
  scope: '[data-test-selected-instructors]',
  heading: text('[data-test-heading]'),
  instructors: collection('li', {
    remove: clickable('button'),
    isRemovable: isPresent('button'),
    userNameInfo,
  }),
  noInstructors: {
    scope: '[data-test-no-selected-instructors]',
  },
};

export default definition;
export const component = create(definition);
