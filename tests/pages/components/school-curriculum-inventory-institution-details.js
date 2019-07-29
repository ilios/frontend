import {
  clickable,
  create,
  text,
  isPresent,
} from 'ember-cli-page-object';

const definition = {
  scope: "[data-test-school-curriculum-inventory-institution-details]",
  header: {
    scope: "[data-test-school-curriculum-inventory-institution-details-header]",
    manage: clickable('.actions button'),
    manageTitle: text('.actions button'),
    hasManageAction: isPresent('.actions button'),
    title: text('.title')
  },
  content: {
    scope: "[data-test-school-curriculum-inventory-institution-details-content]",
    name: text("[data-test-institution-name] span"),
    nameLabel: text("[data-test-institution-name] label"),
    aamcCode: text("[data-test-institution-aamc-code] span"),
    aamcCodeLabel: text("[data-test-institution-aamc-code] label"),
    addressStreet: text("[data-test-institution-address-street] span"),
    addressStreetLabel: text("[data-test-institution-address-street] label"),
    addressCity: text("[data-test-institution-address-city] span"),
    addressCityLabel: text("[data-test-institution-address-city] label"),
    addressStateOrProvince: text("[data-test-institution-address-state-or-province] span"),
    addressStateOrProvinceLabel: text("[data-test-institution-address-state-or-province] label"),
    addressZipCode: text("[data-test-institution-address-zip-code] span"),
    addressZipCodeLabel: text("[data-test-institution-address-zip-code] label"),
    addressCountryCode: text("[data-test-institution-address-country-code] span"),
    addressCountryCodeLabel: text("[data-test-institution-address-country-code] label"),
    noInfo: text('[data-test-institution-none-exists-message]'),
  }
};

export default definition;
export const component = create(definition);
