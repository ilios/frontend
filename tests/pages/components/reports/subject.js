import {
  attribute,
  clickable,
  create,
  collection,
  fillable,
  isPresent,
  property,
  text,
} from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-reports-subject]',
  backToReports: {
    scope: '[data-test-back-to-reports]',
  },
  title: text('[data-test-report-header] [data-test-title]'),
  download: clickable('[data-test-download]'),
  academicYears: {
    scope: '[data-test-year-filter]',
    choose: fillable(),
    items: collection('option', {
      isSelected: property('selected'),
    }),
  },
  results: collection('[data-test-results] li', {
    link: attribute('href', 'a'),
    hasLink: isPresent('a'),
  }),
};

export default definition;
export const component = create(definition);
