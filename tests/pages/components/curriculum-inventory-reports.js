import { clickable, collection, create, fillable, isPresent, property, text, value } from 'ember-cli-page-object';
import newReport from './new-curriculum-inventory-report';
import reports from './curriculum-inventory-report-list';

const definition = {
  scope: '[data-test-curriculum-inventory-reports]',
  toggleNewReportForm: clickable('[data-test-expand-collapse-button] button'),
  newReport,
  reports,
  schools: {
    scope: '[data-test-schools-filter]',
    options: collection('select option', {
      isSelected: property('selected'),
    }),
    select: fillable('select'),
    value: value('select'),
    isSelectable: isPresent('select')
  },
  programs: {
    scope: '[data-test-programs-filter]',
    options: collection('select option', {
      isSelected: property('selected'),
    }),
    select: fillable('select'),
    value: value('select'),
    isSelectable: isPresent('select')
  },
  savedResult: text('[data-test-saved-results]'),
};

export default definition;
export const component = create(definition);
