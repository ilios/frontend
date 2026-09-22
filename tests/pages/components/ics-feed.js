import { create, text } from 'ember-cli-page-object';
import copy from './copy-button';

const definition = {
  scope: '[data-test-ics-feed]',
  instructions: text('[data-test-instructions]'),
  copy,
};

export default definition;
export const component = create(definition);
