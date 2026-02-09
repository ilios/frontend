import { clickable, create, hasClass, text } from 'ember-cli-page-object';
import manager from './learning-material-attributes-manager';

const definition = {
  scope: '[data-test-school-learning-material-attributes-expanded]',
  collapse: clickable('[data-test-title]'),
  manage: clickable('[data-test-manage]'),
  save: clickable('[data-test-save]'),
  cancel: clickable('[data-test-cancel]'),
  attributes: {
    scope: '[data-test-attributes]',
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
  },
  manager,
};

export default definition;
export const component = create(definition);
