import { attribute, clickable, create, hasClass } from 'ember-cli-page-object';
import { hasFocus } from 'ilios-common';

const definition = {
  scope: '[data-test-link-to-with-action]',
  url: attribute('href'),
  hasFocus: hasFocus(),
  isActive: hasClass('active'),
  click: clickable(),
};

export default definition;
export const component = create(definition);
