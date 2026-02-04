import { clickable, collection, create } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-detail-cohort-manager]',
  selectedCohorts: collection('[data-test-selected-cohort]', {
    remove: clickable('button'),
  }),
  selectableCohorts: collection('[data-test-selectable-cohort]', {
    add: clickable('button'),
  }),
};

export default definition;
export const component = create(definition);
