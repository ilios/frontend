import { create, hasClass } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-yes-no]',
  yes: hasClass('yes'),
  no: hasClass('no'),
};

export default definition;
export const component = create(definition);
