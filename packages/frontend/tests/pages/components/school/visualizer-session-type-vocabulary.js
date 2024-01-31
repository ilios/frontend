import { collection, create, notHasClass } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-school-visualizer-session-type-vocabulary]',
  isIcon: notHasClass('no-icon'),
  chart: {
    scope: '.simple-chart',
    slices: collection('svg .slice'),
    labels: collection('.slice text'),
    descriptions: collection('.slice desc'),
  },
};

export default definition;
export const component = create(definition);
