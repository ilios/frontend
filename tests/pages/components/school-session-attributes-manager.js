import { clickable, create, property, text } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-school-session-attributes-manager]',
  attendanceRequired: {
    scope: '[data-test-attendance-required]',
    label: text('td:nth-of-type(1)'),
    isChecked: property('checked', 'input'),
    check: clickable('input'),
  },
  supplemental: {
    scope: '[data-test-supplemental]',
    label: text('td:nth-of-type(1)'),
    isChecked: property('checked', 'input'),
    check: clickable('input'),
  },
  specialAttireRequired: {
    scope: '[data-test-special-attire-required]',
    label: text('td:nth-of-type(1)'),
    isChecked: property('checked', 'input'),
    check: clickable('input'),
  },
  specialEquipmentRequired: {
    scope: '[data-test-special-equipment-required]',
    label: text('td:nth-of-type(1)'),
    isChecked: property('checked', 'input'),
    check: clickable('input'),
  },
};

export default definition;
export const component = create(definition);
