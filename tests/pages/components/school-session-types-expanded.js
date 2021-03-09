import { clickable, create } from 'ember-cli-page-object';
import newSessionType from './school-session-type-form';
import manager from './school-session-type-manager';
import list from './school-session-types-list';

const definition = {
  scope: '[data-test-school-session-types-expanded]',
  collapse: clickable('[data-test-collapse]'),
  createNew: clickable('[data-test-expand-collapse-button] button'),
  newSessionType,
  manager,
  list,
};

export default definition;
export const component = create(definition);
