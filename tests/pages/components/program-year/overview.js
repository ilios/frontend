import { clickable, collection, create } from 'ember-cli-page-object';
import search from 'ilios-common/page-objects/components/user-search';
import userNameInfo from 'ilios-common/page-objects/components/user-name-info';

const definition = {
  scope: '[data-test-programyear-overview]',
  directors: collection('[data-test-directors]', {
    remove: clickable('[data-test-remove]'),
    userNameInfo,
  }),
  search,
};

export default definition;
export const component = create(definition);
