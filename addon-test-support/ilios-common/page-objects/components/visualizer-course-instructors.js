import { collection, create, notHasClass } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-visualizer-course-instructors]',
  isIcon: notHasClass('no-icon'),
  chart: {
    scope: '.simple-chart',
    bars: collection('.bars rect'),
    labels: collection('.bars text'),
    slices: collection('svg .slice'),
  },
};

export default definition;
export const component = create(definition);
