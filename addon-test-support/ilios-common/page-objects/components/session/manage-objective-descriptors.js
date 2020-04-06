import {
  create,
} from 'ember-cli-page-object';
import meshManager from '../mesh-manager';

const definition = {
  scope: '[data-test-session-manage-objective-descriptors]',
  meshManager,
};

export default definition;
export const component = create(definition);
