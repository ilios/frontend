import { collection, clickable, create, fillable, property, text } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-user-profile-cohorts-manager]',
  primaryCohort: {
    scope: '[data-test-primary-cohort]',
    remove: clickable('[data-test-remove]'),
    title: text('[data-test-title]'),
  },
  secondaryCohorts: collection('[data-test-secondary-cohorts] li', {
    promote: clickable('[data-test-promote]'),
    remove: clickable('[data-test-remove]'),
    title: text('[data-test-title]'),
  }),
  schools: {
    scope: '[data-test-schools]',
    filter: {
      scope: '[data-test-filter]',
      select: fillable(),
      options: collection('option', {
        selected: property('selected'),
      }),
    },
  },
  assignableCohorts: collection('[data-test-assignable-cohort]', {
    add: clickable('[data-test-add]'),
    title: text('[data-test-title]'),
  }),
};

export default definition;
export const component = create(definition);
