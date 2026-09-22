import { clickable, create, hasClass, isPresent } from 'ember-cli-page-object';
import userStatus from './user-status';

const definition = {
  scope: '[data-test-result]',
  isActive: hasClass('active'),
  click: clickable('button'),
  canAdd: isPresent('button'),
  userStatus,
};

export default definition;
export const component = create(definition);
