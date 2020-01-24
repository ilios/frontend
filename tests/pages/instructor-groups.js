import {
  clickable,
  create,
  collection,
  fillable,
  isPresent,
  isVisible,
  property,
  text,
  visitable,
} from 'ember-cli-page-object';

export default create({
  scope: '[data-test-instructor-groups-list]',
  visit: visitable('/instructorgroups'),
  filterBySchool: fillable('[data-test-school-filter]'),
  filterByTitle: fillable('[data-test-title-filter]'),
  schoolFilters: collection({
    itemScope: '[data-test-school-filter] option',
    item: {
      text: text(),
      selected: property('selected'),
    },
  }),
  instructorGroups: collection({
    scope: '[data-test-instructor-groups-list]',
    itemScope: '[data-test-active-row]',
    item: {
      title: text('td', { at: 0 }),
      members: text('td', { at: 1 }),
      courses: text('td', { at: 2 }),
      remove: clickable('.remove', {scope: 'td:eq(3)'}),
      edit: clickable('.edit', {scope: 'td:eq(3)'}),
      clickTitle: clickable('a', {scope: 'td:eq(0)'}),
      canBeDeleted: isPresent('.remove', {scope: 'td:eq(3)'}),
    },

  }),
  newInstructorGroupForm: {
    scope: '[data-test-new-instructor-group]',
    title: fillable('[data-test-title]'),
    save: clickable('.done'),
    cancel: clickable('.cancel'),
    isVisible: isVisible(),
  },
  confirmInstructorGroupRemoval: clickable('[data-test-instructor-groups-list] .confirm-removal button.remove'),
  cancelInstructorGroupRemoval: clickable('[data-test-instructor-groups-list] .confirm-removal button.done'),
  removalConfirmationMessage: text('[data-test-instructor-groups-list] .confirm-removal .confirm-message'),
  emptyListRowIsVisible: isVisible('[data-test-empty-list]'),
  savedResult: text('.saved-result'),
  toggleNewInstructorGroupForm: clickable('[data-test-expand-collapse-button] button'),
});
