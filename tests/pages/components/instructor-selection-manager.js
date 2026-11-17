import { create } from 'ember-cli-page-object';

import selectedInstructorGroups from './selected-instructor-groups';
import selectedInstructors from './selected-instructors';
import search from './user-search';
const definition = {
  scope: '[data-test-instructor-selection-manager]',
  search,
  selectedInstructors,
  selectedInstructorGroups,
};

export default definition;
export const component = create(definition);
