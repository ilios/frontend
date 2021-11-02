import { create, hasClass } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-curriculum-inventory-report-publication-status]',
  isFinalized: hasClass('published'),
};

export default definition;
export const component = create(definition);
