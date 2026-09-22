import { clickable, create, fillable, property, text } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-school-learning-material-attributes-manager]',
  accessibilityRequired: {
    scope: '[data-test-accessibility-required]',
    label: text('td:nth-of-type(1)'),
    isChecked: property('checked', 'input'),
    check: clickable('input'),
  },
  accessibilityRequirementsLink: {
    scope: '[data-test-accessibility-requirements-link]',
    label: text('td:nth-of-type(1)'),
    isEmpty: property('value', ''),
    update: fillable('input'),
  },
};

export default definition;
export const component = create(definition);
