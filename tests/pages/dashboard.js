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
      chooseYear: fillable('[data-test-year-filter]'),
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
      chooseSchool: fillable('[data-test-report-school]'),
      chooseSubject: fillable('[data-test-report-subject]'),
      chooseObjectType: fillable('[data-test-report-object-type]'),
      chooseObject: fillable('[data-test-report-object]'),
      objectCount: count('[data-test-report-object] option'),
      chooseAcademicYear: fillable('[data-test-report-year-filter]'),
      fillMeshSearch: fillable('[data-test-mesh-manager] [data-test-search-box] input'),
      runMeshSearch: clickable('[data-test-mesh-manager] [data-test-search-box] .search-icon'),
      meshSearchResults: collection({
        itemScope: '[data-test-search-results] li',
        item: {
          name: text('[data-test-name]'),
          pick: clickable()
        },
      }),
      save: clickable('[data-test-report-save]'),
    }
  },
});
