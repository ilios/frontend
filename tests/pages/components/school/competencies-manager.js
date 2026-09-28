import { collection, clickable, create, property } from 'ember-cli-page-object';
import editor from './competency-title-editor';
import newCompetency from './new-competency';

const definition = {
  scope: '[data-test-school-competencies-manager]',
  domains: collection('[data-test-domain]', {
    details: {
      scope: '[data-test-domain-details]',
      editor,
    },
    remove: clickable('[data-test-remove-domain]'),
    removeDisabled: property('disabled', null, { scope: '[data-test-remove-domain]' }),
    competencies: collection('[data-test-competency]', {
      remove: clickable('[data-test-remove-competency]'),
      removeDisabled: property('disabled', null, { scope: '[data-test-remove-competency]' }),
      editor,
    }),
    newCompetency,
  }),
  newDomain: {
    scope: '[data-test-new-domain]',
    newCompetency,
  },
};

export default definition;
export const component = create(definition);
