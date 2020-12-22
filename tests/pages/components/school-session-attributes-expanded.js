import {clickable, create, hasClass, text} from 'ember-cli-page-object';
import manager from './school-session-attributes-manager';

const definition = {
  scope: '[data-test-school-session-attributes-expanded]',
  collapse: clickable('[data-test-collapse]'),
  manage: clickable('[data-test-manage]'),
  save: clickable('[data-test-save]'),
  cancel: clickable('[data-test-cancel]'),
  attributes: {
    scope: '[data-test-attributes]',
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
    }
  },
  manager,
};

export default definition;
export const component = create(definition);
