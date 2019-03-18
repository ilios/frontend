import {
  collection,
} from 'ember-cli-page-object';

export default {
  scope: '[data-test-leadership-list]',
  directors: collection('[data-test-directors] ul li', {}),
  administrators: collection('[data-test-administrators] ul li', {}),
};
