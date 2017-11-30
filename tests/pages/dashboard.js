import {
  clickable,
  count,
  create,
  collection,
  fillable,
  isPresent,
  text,
  visitable
} from 'ember-cli-page-object';

import selectable from '../helpers/selectable';

export default create({
  scope: '[data-test-dashboard]',
  visit: visitable('/dashboard'),
  myReports: {
    scope: '[data-test-myreports]',
    addNewReport: clickable('[data-test-add-new-report]'),
    reports: collection({
      itemScope: '[data-test-saved-reports] tr',
      item: {
        title: text('td:eq(0)'),
        select: clickable('.clickable', { scope: 'td:eq(0)' })
      },
    }),
    selectedReport: {
      scope: '[data-test-selected-report]',
      title: text('[data-test-report-title]'),
      yearsFilterExists: isPresent('[data-test-year-filter]'),
      chooseYear: selectable('[data-test-year-filter]'),
      results: collection({
        itemScope: '[data-test-results] li',
        item: {
          title: text(),
        },
      }),
    },
    newReport: {
      scope: '[data-test-new-report]',
      setTitle: fillable('[data-test-report-title]'),
      chooseSchool: selectable('[data-test-report-school]'),
      chooseSubject: selectable('[data-test-report-subject]'),
      chooseObjectType: selectable('[data-test-report-object-type]'),
      chooseObject: selectable('[data-test-report-object]'),
      objectCount: count('[data-test-report-object] option'),
      chooseAcademicYear: selectable('[data-test-report-year-filter]'),
      save: clickable('[data-test-report-save]'),
    }
  },
});
