import {
  clickable,
  create,
  fillable,
  text,
  isPresent,
  value,
} from 'ember-cli-page-object';

const definition = {
  scope: "[data-test-school-curriculum-inventory-institution-manager]",
  header: {
    scope: "[data-test-school-curriculum-inventory-institution-manager-header]",
    save: clickable('.actions button.bigadd'),
    cancel: clickable('.actions button.bigcancel'),
    hasSaveButton: isPresent('.actions button.bigadd'),
    title: text('.title')
  },
  content: {
    scope: "[data-test-school-curriculum-inventory-institution-manager-content]",
    name: {
      scope: "[data-test-institution-name]",
      label: text('label'),
      change: fillable('input'),
      value: value('input'),
      hasError: isPresent('.validation-error-message'),
      errorMessage: text('.validation-error-message'),
    },
    aamcCode: {
      scope: "[data-test-institution-aamc-code]",
      label: text('label'),
      change: fillable('input'),
      value: value('input'),
      hasError: isPresent('.validation-error-message'),
      errorMessage: text('.validation-error-message'),
    },
    addressStreet: {
      scope: "[data-test-institution-address-street]",
      label: text('label'),
      change: fillable('input'),
      value: value('input'),
      hasError: isPresent('.validation-error-message'),
      errorMessage: text('.validation-error-message'),
    },
    addressCity: {
      scope: "[data-test-institution-address-city]",
      label: text('label'),
      change: fillable('input'),
      value: value('input'),
      hasError: isPresent('.validation-error-message'),
      errorMessage: text('.validation-error-message'),
    },
    addressStateOrProvince: {
      scope: "[data-test-institution-address-state-or-province]",
      label: text('label'),
      change: fillable('input'),
      value: value('input'),
      hasError: isPresent('.validation-error-message'),
      errorMessage: text('.validation-error-message'),
    },
    addressZipCode: {
      scope: "[data-test-institution-address-zip-code]",
      label: text('label'),
      change: fillable('input'),
      value: value('input'),
      hasError: isPresent('.validation-error-message'),
      errorMessage: text('.validation-error-message'),
    },
    addressCountryCode: {
      scope: "[data-test-institution-address-country-code]",
      label: text('label'),
      change: fillable('input'),
      value: value('input'),
      hasError: isPresent('.validation-error-message'),
      errorMessage: text('.validation-error-message'),
    },
  }
};

export default definition;
export const component = create(definition);
