import { clickable, create, text } from 'ember-cli-page-object';
import instructorSelectionManager from './instructor-selection-manager';
import selectedInstructors from './selected-instructors';
import selectedInstructorGroups from './selected-instructor-groups';

const definition = {
  scope: '[data-test-detail-instructors]',
  manage: clickable('[data-test-manage]'),
  save: clickable('[data-test-save]'),
  cancel: clickable('[data-test-cancel]'),
  title: text('[data-test-title]', { at: 0 }),
  selectedInstructors,
  selectedInstructorGroups,
  manager: instructorSelectionManager,
};

export default definition;
export const component = create(definition);
