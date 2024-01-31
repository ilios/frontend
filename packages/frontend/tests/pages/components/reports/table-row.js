import { clickable, create, isVisible, text } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-reports-table-row]',
  title: text('[data-test-report-title]'),
  select: clickable('[data-test-report-title] a'),
  canRemove: isVisible('[data-test-remove]', { scope: '[data-test-status]' }),
  remove: clickable('[data-test-remove]', { scope: '[data-test-status]' }),
};

export default definition;
export const component = create(definition);
