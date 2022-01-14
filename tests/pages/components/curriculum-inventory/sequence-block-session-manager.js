import { collection, clickable, create, property } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-curriculum-inventory-sequence-block-session-manager]',
  save: clickable('[data-test-save]'),
  cancel: clickable('[data-test-cancel]'),
  header: {
    scope: 'thead',
    countAsOneOffering: {
      scope: 'th:nth-of-type(1)',
      isChecked: property('checked', 'input'),
      isPartiallyChecked: property('indeterminate', 'input'),
      toggle: clickable('input'),
    },
    exclude: {
      scope: 'th:nth-of-type(2)',
      isChecked: property('checked', 'input'),
      isPartiallyChecked: property('indeterminate', 'input'),
      toggle: clickable('input'),
    },
    title: {
      scope: 'th:nth-of-type(3)',
      click: clickable('button'),
    },
    sessionType: {
      scope: 'th:nth-of-type(4)',
      click: clickable('button'),
    },
    totalTime: {
      scope: 'th:nth-of-type(5)',
    },
    offeringsCount: {
      scope: 'th:nth-of-type(6)',
      click: clickable('button'),
    },
  },
  sessions: collection('tbody tr', {
    countAsOneOffering: {
      scope: 'td:nth-of-type(1)',
      isChecked: property('checked', 'input'),
      toggle: clickable('input'),
    },
    exclude: {
      scope: 'td:nth-of-type(2)',
      isChecked: property('checked', 'input'),
      toggle: clickable('input'),
    },
    title: {
      scope: 'td:nth-of-type(3)',
    },
    sessionType: {
      scope: 'td:nth-of-type(4)',
    },
    totalTime: {
      scope: 'td:nth-of-type(5)',
    },
    offeringsCount: {
      scope: 'td:nth-of-type(6)',
    },
  }),
};

export default definition;
export const component = create(definition);
