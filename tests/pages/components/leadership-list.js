import {
  collection,
} from 'ember-cli-page-object';

export default {
  scope: '[data-test-leadership-list]',
  directors: collection({
    scope: '[data-test-directors] ul',
    itemScope: 'li',
  }),
  administrators: collection({
    scope: '[data-test-administrators] ul',
    itemScope: 'li',
  }),
};
