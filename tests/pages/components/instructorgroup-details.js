import { clickable, collection, create, fillable, text } from 'ember-cli-page-object';
import { default as header } from './instructorgroup-header';
import userNameInfo from 'ilios-common/page-objects/components/user-name-info';

const definition = {
  scope: '[data-test-instructorgroup-details]',
  header,
  overview: {
    scope: '[data-test-overview]',
    title: text('[data-test-title]'),
    search: {
      scope: '[data-test-user-search]',
      set: fillable('input'),
      results: collection('[data-test-result]', {
        add: clickable(),
      }),
    },
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
