import { create } from 'ember-cli-page-object';
import search from './user-search';
import selectedInstructors from './selected-instructors';
import selectedInstructorGroups from './selected-instructor-groups';
const definition = {
  scope: '[data-test-instructor-selection-manager]',
  search,
  selectedInstructors,
  selectedInstructorGroups,
};

export default definition;
export const component = create(definition);
