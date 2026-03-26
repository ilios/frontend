import { collection, clickable, create, isVisible } from 'ember-cli-page-object';
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
    isRemovable: isVisible('[data-test-remove-domain]'),
    competencies: collection('[data-test-competency]', {
      remove: clickable('[data-test-remove-competency]'),
      isRemovable: isVisible('[data-test-remove-competency]'),
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
