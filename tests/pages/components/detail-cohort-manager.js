import { clickable, collection, create, selectable, text } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-detail-cohort-manager]',
  selectedCohorts: collection('[data-test-selected-cohort]', {
    remove: clickable('button'),
    text: text('button'),
  }),
  selectableCohorts: collection('[data-test-selectable-cohort]', {
    add: clickable('button'),
    text: text('button'),
  }),
  schoolFilter: {
    scope: '[data-test-school-filter]',
    select: selectable(),
  },
  programFilter: {
    scope: '[data-test-program-filter]',
    select: selectable(),
  },
};

export default definition;
export const component = create(definition);
