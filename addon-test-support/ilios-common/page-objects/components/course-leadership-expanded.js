import {
  create,
  clickable,
  text
} from 'ember-cli-page-object';
import leadershipList from './leadership-list';
import leadershipManager from './leadership-manager';

const definition = {
  scope: '[data-test-course-leadership-expanded]',
  title: text('[data-test-title]'),
  collapse: clickable('[data-test-title]'),
  manage: clickable('[data-test-manage]'),
  save: clickable('[data-test-save]'),
  cancel: clickable('[data-test-cancel]'),
  leadershipList,
  leadershipManager,
};

export default definition;
export const component = create(definition);
