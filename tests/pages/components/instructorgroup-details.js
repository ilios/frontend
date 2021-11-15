import { clickable, collection, create, text } from 'ember-cli-page-object';
import { default as header } from './instructorgroup-header';
import userNameInfo from 'ilios-common/page-objects/components/user-name-info';
import search from 'ilios-common/page-objects/components/user-search';

const definition = {
  scope: '[data-test-instructorgroup-details]',
  header,
  overview: {
    scope: '[data-test-overview]',
    title: text('[data-test-title]'),
    search,
    users: collection('[data-test-user]', {
      userNameInfo,
      remove: clickable('[data-test-remove]'),
    }),
    courses: collection('[data-test-course]', {
      visit: clickable('a'),
    }),
  },
};

export default definition;
export const component = create(definition);
