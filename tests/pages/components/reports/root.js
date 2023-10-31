import { clickable, create, fillable, isHidden, text } from 'ember-cli-page-object';
import { hasFocus } from 'ilios-common';
import list from './list';
import newSubject from './new-subject';

const definition = {
  scope: '[data-test-reports-root]',
  filterByTitle: fillable('[data-test-title-filter]'),
  headerTitle: text('[data-test-reports-header-title]'),
  toggleNewSubjectReportForm: clickable('[data-test-expand-collapse-button] button'),
  newSubject,
  newReportLink: text('[data-test-newly-saved-report] a'),
  newReportLinkIsHidden: isHidden('[data-test-newly-saved-report] a'),
  visitNewReport: clickable('[data-test-newly-saved-report] a'),
  filterHasFocus: hasFocus('[data-test-title-filter]'),
  list,
};

export default definition;
export const component = create(definition);
