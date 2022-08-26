import { attribute, create, hasClass } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-dashboard-view-picker]',
  calendar: {
    scope: '[data-test-link-calendar]',
    linkTarget: attribute('href'),
    isActive: hasClass('active'),
  },
  materials: {
    scope: '[data-test-link-materials]',
    linkTarget: attribute('href'),
    isActive: hasClass('active'),
  },
  week: {
    scope: '[data-test-link-week]',
    linkTarget: attribute('href'),
    isActive: hasClass('active'),
  },
};

export default definition;
export const component = create(definition);
