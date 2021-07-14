import { collection, create, fillable, text, value } from 'ember-cli-page-object';

const definition = create({
  scope: '[data-test-course-visualize-session-types]',
  title: text('[data-test-title]'),
  filter: {
    scope: '[data-test-filter]',
    value: value('input'),
    set: fillable('input'),
  },
  chart: {
    scope: '.simple-chart-horz-bar',
    bars: collection('.bars rect'),
    labels: collection('.bars text'),
  },
});

export default definition;
export const component = create(definition);
