import { clickable, create, hasClass, text } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-school-learning-material-attributes-collapsed]',
  expand: clickable('[data-test-title]'),
  accessibilityRequired: {
    scope: '[data-test-accessibility-required]',
    label: text('td:nth-of-type(1)'),
    isEnabled: hasClass('fa-check', 'td:nth-of-type(2) svg'),
    isDisabled: hasClass('fa-ban', 'td:nth-of-type(2) svg'),
  },
  accessibilityRequirementsLink: {
    scope: '[data-test-accessibility-requirements-link]',
    label: text('td:nth-of-type(1)'),
    link: text('td:nth-of-type(2) span'),
  },
};

export default definition;
export const component = create(definition);
