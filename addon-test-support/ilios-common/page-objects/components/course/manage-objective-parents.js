import {
  create,
  clickable,
  collection,
  fillable,
  hasClass,
  isPresent,
  notHasClass,
  text,
  value,
} from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-course-manage-objective-parents]',
  hasMultipleCohorts: isPresent('[data-test-cohort-selector]'),
  selectedCohortTitle: text('[data-test-selected-cohort-title]'),
  selectedCohortId: value('[data-test-cohort-selector]'),
  selectCohort: fillable('[data-test-cohort-selector]'),
  cohorts: collection('[data-test-cohort-selector] option', {
    title: text(),
    value: value(),
  }),
  competencies: collection('.parent-picker [data-test-competency]', {
    title: text('.competency-title'),
    selected: hasClass('selected'),
    notSelected: notHasClass('selected'),
    objectives: collection('ul li', {
      title: text(),
      selected: hasClass('selected', 'label'),
      notSelected: notHasClass('selected', 'label'),
      add: clickable('input')
    }),
  }),
  hasNoCohortWarning: isPresent('[data-test-no-cohorts-message]'),
};

export default definition;
export const component = create(definition);
