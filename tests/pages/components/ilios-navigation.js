import { collection, create, hasClass, text } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-ilios-navigation]',
  expandCollapse: {
    scope: '[data-test-expand-collapse]',
  },
  isExpanded: hasClass('expanded'),
  links: collection('[data-test-navigation-links] li', {
    text: text('.text'),
  }),
};

export default definition;
export const component = create(definition);
