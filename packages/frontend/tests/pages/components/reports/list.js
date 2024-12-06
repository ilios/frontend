import { clickable, create, fillable, isHidden, text } from 'ember-cli-page-object';
import { hasFocus } from 'ilios-common';
import table from './table';
import newSubject from './new-subject';
import chooser from './choose-new-report';

const definition = {
  filterByTitle: fillable('[data-test-title-filter]'),
  headerTitle: text('[data-test-reports-header-title]'),
  chooser,
  newSubject,
  newReportLink: text('[data-test-newly-saved-report] a'),
  newReportLinkIsHidden: isHidden('[data-test-newly-saved-report] a'),
  visitNewReport: clickable('[data-test-newly-saved-report] a'),
  filterHasFocus: hasFocus('[data-test-title-filter]'),
  table,
};

export default definition;
export const component = create(definition);
