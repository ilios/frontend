import { clickable, create, collection, fillable, property, text } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-reports-curriculum-header]',
  runSummaryText: text('[data-test-run-summary]'),
  reportSelector: {
    scope: '[data-test-report-selector]',
    set: fillable('select'),
    options: collection('option', {
      isSelected: property('selected'),
    }),
    value: property('value', 'select'),
  },
  runReport: {
    scope: '[data-test-run]',
    click: clickable(),
  },
  close: {
    scope: '[data-test-close]',
    click: clickable(),
  },
  download: {
    scope: '[data-test-download]',
    click: clickable(),
  },
  copy: {
    scope: '[data-test-copy-button]',
    click: clickable(),
  },
};

export default definition;
export const component = create(definition);
