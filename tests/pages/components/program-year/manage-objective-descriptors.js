import {
  create,
} from 'ember-cli-page-object';
import meshManager from 'ilios-common/page-objects/components/mesh-manager';

const definition = {
  scope: '[data-test-program-year-manage-objective-descriptors]',
  meshManager,
};

export default definition;
export const component = create(definition);
