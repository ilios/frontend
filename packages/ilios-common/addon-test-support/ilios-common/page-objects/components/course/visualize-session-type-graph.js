import { attribute, clickable, collection, create, notHasClass, text } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-course-visualize-session-type-graph]',
  isIcon: notHasClass('no-icon'),
  chart: {
    scope: '.simple-chart',
    bars: collection('.bars rect', {
      description: text('desc'),
    }),
    labels: collection('.bars text'),
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
      vocabularyTerm: {
        scope: '[data-test-vocabulary-term]',
        toggle: clickable('button'),
      },
      sessions: {
        scope: '[data-test-sessions]',
        toggle: clickable('button'),
      },
      minutes: {
        scope: '[data-test-minutes]',
        toggle: clickable('button'),
      },
    },
    rows: collection('tbody tr', {
      vocabularyTerm: text('[data-test-vocabulary-term]'),
      sessions: {
        scope: '[data-test-sessions]',
        links: collection('a', {
          url: attribute('href'),
        }),
      },
      minutes: text('[data-test-minutes]'),
    }),
  },
};

export default definition;
export const component = create(definition);
