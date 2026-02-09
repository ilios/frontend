import { clickable, create, text } from 'ember-cli-page-object';
import competenciesManager from './competencies-manager';
import competenciesList from './competencies-list';

const definition = {
  scope: '[data-test-school-competencies-expanded]',
  title: text('[data-test-header] [data-test-title]'),
  readModeTitle: text('[data-test-header] [data-test-title]'),
  collapser: {
    scope: '[data-test-header] [data-test-title]',
  },
  save: clickable('[data-test-actions] [data-test-save]'),
  cancel: clickable('[data-test-actions] [data-test-cancel]'),
  manage: clickable('[data-test-actions] [data-test-manage]'),
  competenciesManager,
  competenciesList,
};

export default definition;
export const component = create(definition);
