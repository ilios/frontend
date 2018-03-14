import {
  create,
  clickable,
  collection,
  fillable,
  isVisible,
  text,
  visitable
} from 'ember-cli-page-object';

export default create({
  visit: visitable('/learnergroups/:learnerGroupId'),
  activateBulkAssign: clickable('[data-test-activate-bulk-assign]'),
  bulkAssign: {
    validUploadedUsers: collection({
      itemScope: '[data-test-upload-data-valid-users] tbody tr',
      item: {
        firstName: text('td', { at: 1 }),
        lastName: text('td', { at: 2 }),
        campusId: text('td', { at: 3 }),
        smallGroupName: text('td', { at: 4 }),
      }
    }),
    invalidUploadedUsers: collection({
      itemScope: '[data-test-upload-data-invalid-users] tbody tr',
      item: {
        firstName: text('td', { at: 0 }),
        lastName: text('td', { at: 1 }),
        campusId: text('td', { at: 2 }),
        smallGroupName: text('td', { at: 3 }),
        errors: text('td', { at: 4 }),
      }
    }),
    showConfirmUploadButton: isVisible('[data-test-upload-data-confirm]'),
    confirmUploadedUsers: clickable('[data-test-upload-data-confirm]'),

    groupsToMatch: collection({
      itemScope: '[data-test-match-groups-unmatched] tbody tr',
      item: {
        name: text('[data-test-group-name]', {scope: 'td:eq(0)'}),
        createNewGroup: clickable('[data-test-create-group]', {scope: 'td:eq(0)'}),
        chooseGroup: fillable('td:eq(1) select'),
      }
    }),

    finalData: collection({
      itemScope: '[data-test-final-data] tbody tr',
      item: {
        name: text('td', { at: 0 }),
        campusId: text('td', { at: 1 }),
        groupName: text('td', { at: 2 }),
      }
    }),

    finalErrorData: collection({
      itemScope: '[data-test-final-error-data] tbody tr',
      item: {
        name: text('td', { at: 0 }),
        campusId: text('td', { at: 1 }),
        error: text('td', { at: 2 }),
      }
    }),

    canSubmitFinalData: isVisible('[data-test-finalize-users-submit]'),
    submitFinalData: clickable('[data-test-finalize-users-submit]'),
  }
});
