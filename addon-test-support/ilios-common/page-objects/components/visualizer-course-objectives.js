import { collection, create, notHasClass } from 'ember-cli-page-object';

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
};

export default definition;
export const component = create(definition);
