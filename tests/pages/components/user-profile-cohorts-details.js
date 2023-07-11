import { collection, clickable, create, text } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-user-profile-cohorts-details]',
  primaryCohort: {
    scope: '[data-test-primary-cohort]',
    remove: clickable('[data-test-remove]'),
    title: text('[data-test-title]'),
  },
  secondaryCohorts: collection('[data-test-secondary-cohorts] li', {
    title: text('[data-test-title]'),
  }),
};

export default definition;
export const component = create(definition);
