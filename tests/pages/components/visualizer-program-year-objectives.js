import { collection, create } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-visualizer-program-year-objectives]',
  chart: {
    scope: '.simple-chart',
    links: collection('svg .link'),
    nodes: collection('svg .node'),
  },
};

export default definition;
export const component = create(definition);
