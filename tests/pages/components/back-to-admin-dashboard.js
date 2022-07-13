import { create, property } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-back-to-admin-dashboard]',
  url: property('href', 'a'),
};

export default definition;
export const component = create(definition);
