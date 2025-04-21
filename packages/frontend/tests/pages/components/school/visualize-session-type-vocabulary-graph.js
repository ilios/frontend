import { clickable, collection, create, notHasClass, text } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-school-visualize-session-type-vocabulary-graph]',
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
      term: {
        scope: '[data-test-term-title]',
        toggle: clickable('button'),
      },
      sessionsCount: {
        scope: '[data-test-sessions-count]',
        toggle: clickable('button'),
      },
    },
    rows: collection('tbody tr', {
      term: text('[data-test-term-title]'),
      sessionsCount: text('[data-test-sessions-count]'),
    }),
  },
};

export default definition;
export const component = create(definition);
