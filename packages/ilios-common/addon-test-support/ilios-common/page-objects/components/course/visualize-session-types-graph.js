import { attribute, clickable, collection, create, notHasClass, text } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-course-visualize-session-types-graph]',
  isIcon: notHasClass('no-icon'),
  chart: {
    scope: '.simple-chart',
    bars: collection('.bars rect', {
      description: text('desc'),
    }),
    labels: collection('.bars text'),
  },
  dataTable: {
    scope: '[data-test-data-table]',
    header: {
      scope: 'thead',
      sessionType: {
        scope: '[data-test-session-type]',
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
      sessionType: text('[data-test-session-type]'),
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
