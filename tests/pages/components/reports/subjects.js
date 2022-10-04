import { clickable, create, collection, text } from 'ember-cli-page-object';
import newReport from './new-subject';

const definition = {
  scope: '[data-test-reports-subjects]',
  title: text('[data-test-title]'),
  newReportFormToggle: {
    scope: '[data-test-expand-collapse-button]',
    click: clickable('button'),
  },
  reports: collection('[data-test-saved-reports] li', {
    title: text('[data-test-report-title]'),
    select: clickable('[data-test-report-title]'),
    remove: clickable('[data-test-remove]'),
  }),
  newReport,
};

export default definition;
export const component = create(definition);
