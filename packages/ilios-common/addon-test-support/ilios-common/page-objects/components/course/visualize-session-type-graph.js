import { collection, create, notHasClass } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-course-visualize-session-type-graph]',
  isIcon: notHasClass('no-icon'),
  chart: {
    scope: '.simple-chart',
    bars: collection('.bars rect'),
    labels: collection('.bars text'),
  },
};

export default definition;
export const component = create(definition);
