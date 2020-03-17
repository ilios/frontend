import {
  create,
  text,
} from 'ember-cli-page-object';
import meshManager from 'ilios-common/page-objects/components/mesh-manager';

const definition = {
  scope: '[data-test-program-year-manage-objective-descriptors]',
  objectiveTitle: text('[data-test-objective-title]'),
  meshManager,
};

export default definition;
export const component = create(definition);
