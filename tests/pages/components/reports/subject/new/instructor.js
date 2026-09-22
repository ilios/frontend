import { clickable, create, isPresent, text } from 'ember-cli-page-object';
import userSearch from 'ilios-common/page-objects/components/user-search';

const definition = {
  scope: '[data-test-reports-subject-new-instructor]',
  userSearch,
  hasSelectedInstructor: isPresent('[data-test-remove]'),
  selectedInstructor: text('[data-test-remove]'),
  removeSelectedInstructor: clickable('[data-test-remove]'),
};

export default definition;
export const component = create(definition);
