import { clickable, create, hasClass, text } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-school-session-attributes-collapsed]',
  expand: clickable('[data-test-expand]'),
  attendanceRequired: {
    scope: '[data-test-attendance-required]',
    label: text('td:nth-of-type(1)'),
    isEnabled: hasClass('fa-check', 'td:nth-of-type(2) svg'),
    isDisabled: hasClass('fa-ban', 'td:nth-of-type(2) svg'),
  },
  supplemental: {
    scope: '[data-test-supplemental]',
    label: text('td:nth-of-type(1)'),
    isEnabled: hasClass('fa-check', 'td:nth-of-type(2) svg'),
    isDisabled: hasClass('fa-ban', 'td:nth-of-type(2) svg'),
  },
  specialAttireRequired: {
    scope: '[data-test-special-attire-required]',
    label: text('td:nth-of-type(1)'),
    isEnabled: hasClass('fa-check', 'td:nth-of-type(2) svg'),
    isDisabled: hasClass('fa-ban', 'td:nth-of-type(2) svg'),
  },
  specialEquipmentRequired: {
    scope: '[data-test-special-equipment-required]',
    label: text('td:nth-of-type(1)'),
    isEnabled: hasClass('fa-check', 'td:nth-of-type(2) svg'),
    isDisabled: hasClass('fa-ban', 'td:nth-of-type(2) svg'),
  },
};

export default definition;
export const component = create(definition);
