import { attribute, clickable, collection, create } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-breadcrumbs]',
  crumbs: collection('[data-test-crumb]', {
    link: attribute('href'),
    visit: clickable(),
  }),
};

export default definition;
export const component = create(definition);
