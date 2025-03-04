import { create, hasClass } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-reports-switcher]',
  subject: {
    scope: '[data-test-subject]',
    isActive: hasClass('active'),
  },
  curriculum: {
    scope: '[data-test-curriculum]',
    isActive: hasClass('active'),
  },
};

export default definition;
export const component = create(definition);
