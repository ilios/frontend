import { clickable, collection, create } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-curriculum-inventory-sequence-block-session-list]',
  header: {
    scope: 'thead',
    countAsOneOffering: {
      scope: 'th:nth-of-type(1)',
    },
    exclude: {
      scope: 'th:nth-of-type(2)',
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
    },
    exclude: {
      scope: 'td:nth-of-type(2)',
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
