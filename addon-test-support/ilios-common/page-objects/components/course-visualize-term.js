import { create, text } from 'ember-cli-page-object';

// @todo flesh this out [ST 2021/02/24]
const definition = create({
  scope: '[data-test-course-visualize-term]',
  title: text('[data-test-title]'),
});

export default definition;
export const component = create(definition);
