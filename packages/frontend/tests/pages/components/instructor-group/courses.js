import { attribute, clickable, collection, create, text } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-instructor-group-courses]',
  title: text('[data-test-title]'),
  courses: collection('[data-test-course]', {
    url: attribute('href', 'a'),
    visit: clickable('a'),
  }),
};

export default definition;
export const component = create(definition);
