import { attribute, create, isPresent } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-awesome-icon]',
  ariaHidden: attribute('aria-hidden'),
  ariaLabelledBy: attribute('aria-labelledby'),
  classes: attribute('class'),
  focusable: attribute('focusable'),
  height: attribute('height'),
  innerUse: {
    scope: 'use',
    href: attribute('xlink:href'),
  },
  role: attribute('role'),
  type: attribute('data-icon'),
  title: {
    scope: 'title',
    exists: isPresent(),
  },
  width: attribute('width'),
  x: attribute('x'),
  y: attribute('y'),
};

export default definition;
export const component = create(definition);
