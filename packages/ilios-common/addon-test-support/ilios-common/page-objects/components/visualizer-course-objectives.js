import { attribute, clickable, collection, create, notHasClass, text } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-visualizer-course-objectives]',
  isIcon: notHasClass('no-icon'),
  chart: {
    scope: '.simple-chart',
    slices: collection('svg .slice'),
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
      competency: {
        scope: '[data-test-competency]',
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
      competency: text('[data-test-competency]'),
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
