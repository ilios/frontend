import { registerDeprecationHandler } from '@ember/debug';

const silencedDeprecations = [
  'ember-data:deprecate-legacy-imports',
  'ember-data:deprecate-non-strict-types',
  'common.dates-no-dates',
  'ember-data:deprecate-non-strict-id',
  'ember-data:deprecate-non-unique-relationship-entries',
];

const thrownDeprecations = [
  'common.async-computed',
  'common.resolve-computed',
  'common.competency-is-domain',
  'common.competency-is-not-domain',
  'common.school-cohorts',
  'common.curriculum-inventory-report-is-finalized',
];
export function initialize() {
  registerDeprecationHandler((message, options, next) => {
    if (thrownDeprecations.includes(options.id)) {
      throw new Error(message);
    }
    if (silencedDeprecations.includes(options.id)) {
      return;
    }

    next(message, options);
  });
}

export default { initialize };
