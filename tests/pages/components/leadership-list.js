import {
  collection,
} from 'ember-cli-page-object';

export default {
  scope: '[data-test-leadership-list]',
  directors: collection({
    scope: 'tbody tr td:nth-of-type(1) ul',
    itemScope: 'li',
  }),
  administrators: collection({
    scope: 'tbody tr td:nth-of-type(2) ul',
    itemScope: 'li',
  }),
};
