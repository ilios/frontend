import {
  create,
  text
} from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-single-event]',
  title: text('[data-test-title]'),
  offeredAt: text('[data-test-offered-at]'),
};

export default definition;
export const component = create(definition);
