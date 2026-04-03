import { clickable, create, text } from 'ember-cli-page-object';
import newSessionType from './session-type-form';
import manager from './session-type-manager';
import list from './session-types-list';

const definition = {
  scope: '[data-test-school-session-types-expanded]',
  collapse: clickable('[data-test-header] [data-test-title]'),
  title: text('[data-test-header] [data-test-title]'),
  createNew: clickable('[data-test-expand-collapse-button] button'),
  savedResult: text('[data-test-saved-result]'),
  newSessionType,
  manager,
  list,
};

export default definition;
export const component = create(definition);
