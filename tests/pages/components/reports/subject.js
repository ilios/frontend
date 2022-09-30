import {
  clickable,
  create,
  collection,
  count,
  isPresent,
  fillable,
  text,
  value,
} from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-reports-subject]',
  title: text('[data-test-title]'),
  addNewReport: clickable('[data-test-expand-collapse-button] button'),
  reports: collection('[data-test-saved-reports] li', {
    title: text('[data-test-report-title]'),
    select: clickable('[data-test-report-title]'),
    remove: clickable('[data-test-remove]'),
  }),
  selectedReport: {
    scope: '[data-test-selected-report]',
    title: text('[data-test-report-title]'),
    yearsFilterExists: isPresent('[data-test-year-filter]'),
    chooseYear: fillable('[data-test-year-filter]'),
    currentYear: value('[data-test-year-filter]'),
    results: collection('[data-test-results] li', {
      title: text(),
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
    fillMeshSearch: fillable('[data-test-mesh-manager] [data-test-mesh-search] input'),
    meshSearchResults: collection('[data-test-search-results] li', {
      name: text('[data-test-name]'),
      pick: clickable('button'),
    }),
    save: clickable('[data-test-report-save]'),
  },
};

export default definition;
export const component = create(definition);
