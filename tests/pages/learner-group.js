import {
  create,
  clickable,
  collection,
  fillable,
  hasClass,
  isPresent,
  isVisible,
  text,
  visitable
} from 'ember-cli-page-object';

export default create({
  visit: visitable('/learnergroups/:learnerGroupId'),
  header: {
    scope: '[data-test-learnergroup-header]',
    members: text('[data-test-members]'),
  },
  overview: {
    scope: '.learnergroup-overview',
    manage: clickable('[data-test-manage]'),
    list: collection('.list table:nth-of-type(2) tr', {
      firstName: text('td', {at: 1}),
      lastName: text('td', {at: 2}),
      campusId: text('td', {at: 3}),
      email: text('td', {at: 4}),
      remove: clickable('.no.clickable'),
    }),
  },
  activateBulkAssign: clickable('[data-test-activate-bulk-assign]'),
  bulkAssign: {
    validUploadedUsers: collection({
      itemScope: '[data-test-upload-data-valid-users] tbody tr',
      item: {
        isValid: hasClass('fa-check', 'svg', { scope: 'td:nth-of-type(1)'}),
        hasWarning: hasClass('fa-exclamation-triangle', 'svg', { scope: 'td:nth-of-type(1)'}),
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
  },
  subgroups: {
    scope: '[data-test-learnergroup-subgroup-list]',
    title: text('[data-test-title]'),
    headings: collection('thead th', {
      title: text(),
    }),
    groups: collection('tbody tr', {
      title: text('td', { at: 0 }),
      visit: clickable('td:nth-of-type(1) a'),
      members: text('td', { at: 1 }),
      subgroups: text('td', { at: 2 }),
      courses: text('td', { at: 3 }),
      hasRemoveStyle: hasClass('confirm-removal'),
      actions: {
        scope: '[data-test-actions]',
        canRemove: isPresent('[data-test-remove]'),
        remove: clickable('[data-test-remove]'),
        canCopy: isPresent('[data-test-copy]'),
        copy: clickable('[data-test-copy]'),
      },
      confirmRemoval: {
        scope: '[data-test-confirm-removal]',
        confirm: clickable('[data-test-confirm]'),
        cancel: clickable('[data-test-cancel]'),
        confirmation: text('[data-test-confirmation]'),
      },
      confirmCopy: {
        scope: '[data-test-confirm-copy]',
        confirmWithLearners: clickable('[data-test-confirm-with-learners]'),
        confirmWithoutLearners: clickable('[data-test-confirm-without-learners]'),
        canCopyWithLearners: isPresent('[data-test-confirm-with-learners]'),
        canCopyWithoutLearners: isPresent('[data-test-confirm-without-learners]'),
      },
    }),
  },
  usersInCohort: {
    scope: '.cohortmembers',
    list: collection('tbody tr', {
      scope: '.list',
      firstName: text('td', {at: 1}),
      lastName: text('td', {at: 2}),
      campusId: text('td', { at: 3 }),
      email: text('td', { at: 4 }),
      add: clickable('.yes.clickable'),
    }),
  }
});
