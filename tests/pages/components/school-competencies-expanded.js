import { clickable, create, text } from 'ember-cli-page-object';
import competenciesManager from './school-competencies-manager';
import competenciesList from './school-competencies-list';

const definition = {
  scope: '[data-test-school-competencies-expanded]',
  title: text('[data-test-title]'),
  readModeTitle: text('[data-test-collapse]'),
  collapse: clickable('[data-test-collapse]'),
  save: clickable('[data-test-save]'),
  cancel: clickable('[data-test-cancel]'),
  manage: clickable('[data-test-manage]'),
  competenciesManager,
  competenciesList,
};

export default definition;
export const component = create(definition);
