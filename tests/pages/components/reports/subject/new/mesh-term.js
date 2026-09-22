import { clickable, create, isPresent, text } from 'ember-cli-page-object';
import meshManager from 'frontend/tests/pages/components/mesh-manager';

const definition = {
  scope: '[data-test-reports-subject-new-mesh-term]',
  meshManager,
  hasSelectedTerm: isPresent('[data-test-remove]'),
  selectedTerm: text('[data-test-remove]'),
  removeSelectedTerm: clickable('[data-test-remove]'),
};

export default definition;
export const component = create(definition);
