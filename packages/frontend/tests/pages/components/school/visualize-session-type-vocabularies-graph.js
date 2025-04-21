import { attribute, clickable, collection, create, notHasClass, text } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-school-visualize-session-type-vocabularies-graph]',
  isIcon: notHasClass('no-icon'),
  chart: {
    scope: '.simple-chart',
    slices: collection('svg .slice'),
    labels: collection('.slice text > tspan'),
    descriptions: collection('.slice desc'),
  },
  noData: {
    scope: '[data-test-no-data]',
  },
  dataTable: {
    scope: '[data-test-data-table]',
    actions: {
      scope: '[data-test-data-table-actions]',
      download: {
        scope: '[data-test-download-data]',
      },
    },
    header: {
      scope: 'thead',
      vocabulary: {
        scope: '[data-test-vocabulary-title]',
        toggle: clickable('button'),
      },
      termsCount: {
        scope: '[data-test-terms-count]',
        toggle: clickable('button'),
      },
      sessionsCount: {
        scope: '[data-test-sessions-count]',
        toggle: clickable('button'),
      },
    },
    rows: collection('tbody tr', {
      vocabulary: {
        scope: '[data-test-vocabulary-title]',
        url: attribute('href', 'a'),
      },
      termsCount: text('[data-test-terms-count]'),
      sessionsCount: text('[data-test-sessions-count]'),
    }),
  },
};

export default definition;
export const component = create(definition);
