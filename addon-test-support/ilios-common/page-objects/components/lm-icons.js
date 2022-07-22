import { create, isPresent } from 'ember-cli-page-object';
import lmTypeIcon from './lm-type-icon';

const definition = {
  scope: '[data-test-lm-icons]',
  type: lmTypeIcon,
  isRequired: isPresent('[data-test-required-icon]'),
};

export default definition;
export const component = create(definition);
