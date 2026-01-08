import { attribute, clickable, collection, create, notHasClass, text } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-course-visualize-objectives-graph]',
  isIcon: notHasClass('no-icon'),
  chart: {
    scope: '.simple-chart',
    slices: collection('svg .slice', {
      label: text('text > tspan'),
      description: text('desc'),
    }),
  },
  unlinkedObjectives: {
    scope: '[data-test-with-hours]',
  },
  untaughtObjectives: {
    scope: '[data-test-zero-hours]',
    items: collection('ul li'),
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
      percentage: {
        scope: '[data-test-percentage]',
        toggle: clickable('button'),
      },
      objective: {
        scope: '[data-test-objective]',
        toggle: clickable('button'),
      },
      competencies: {
        scope: '[data-test-competencies]',
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
      percentage: text('[data-test-percentage]'),
      objective: text('[data-test-objective]'),
      competencies: text('[data-test-competencies]'),
      sessions: {
        scope: '[data-test-sessions]',
        links: collection('a', {
          url: attribute('href'),
          ariaLabel: attribute('aria-label'),
        }),
      },
      minutes: text('[data-test-minutes]'),
    }),
  },
};

export default definition;
export const component = create(definition);
