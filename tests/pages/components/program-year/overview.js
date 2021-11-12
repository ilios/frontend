import { clickable, collection, create, fillable, hasClass } from 'ember-cli-page-object';
import userNameInfo from 'ilios-common/page-objects/components/user-name-info';

const definition = {
  scope: '[data-test-programyear-overview]',
  directors: collection('[data-test-directors]', {
    remove: clickable('[data-test-remove]'),
    userNameInfo,
  }),
  // @todo replace with page object [ST 2021/11/08]
  search: {
    scope: '[data-test-user-search]',
    set: fillable('input'),
    results: collection('[data-test-result]', {
      add: clickable(),
      isActive: hasClass('active'),
    }),
  },
};

export default definition;
export const component = create(definition);
