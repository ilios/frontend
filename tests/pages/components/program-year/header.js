import { create, isPresent, text } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-programyear-header]',
  backToProgram: {
    scope: '[data-test-back-to-program]',
  },
  isLocked: isPresent('[data-test-lock]'),
  matriculationYear: text('[data-test-matriculation-year]'),
  cohort: text('[data-test-cohort]'),
};

export default definition;
export const component = create(definition);
