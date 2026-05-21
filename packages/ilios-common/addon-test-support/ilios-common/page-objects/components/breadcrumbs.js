import { attribute, collection, create, text } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-breadcrumbs]',
  crumbs: collection('[data-test-crumb]', {
    link: attribute('href'),
    title: text(),
  }),
};

export default definition;
export const component = create(definition);
