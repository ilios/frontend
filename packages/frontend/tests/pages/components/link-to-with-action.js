import { attribute, clickable, create, hasClass } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-link-to-with-action]',
  url: attribute('href'),
  isActive: hasClass('active'),
  click: clickable(),
};

export default definition;
export const component = create(definition);
