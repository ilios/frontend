import {
  clickable,
  create,
  collection,
  fillable,
  hasClass,
  isVisible,
  text,
} from 'ember-cli-page-object';

import userNameInfo from 'ilios-common/page-objects/components/user-name-info';

const definition = {
  scope: '[data-test-learnergroup-bulk-assignment]',
  validUploadedUsers: collection({
    itemScope: '[data-test-upload-data-valid-users] tbody tr',
    item: {
      isValid: hasClass('fa-check', 'svg', { scope: 'td:nth-of-type(1)' }),
      hasWarning: hasClass('fa-exclamation-triangle', 'svg', { scope: 'td:nth-of-type(1)' }),
      firstName: text('td', { at: 1 }),
      lastName: text('td', { at: 2 }),
      campusId: text('td', { at: 3 }),
      smallGroupName: text('td', { at: 4 }),
    },
  }),
  invalidUploadedUsers: collection({
    itemScope: '[data-test-upload-data-invalid-users] tbody tr',
    item: {
      firstName: text('td', { at: 0 }),
      lastName: text('td', { at: 1 }),
      campusId: text('td', { at: 2 }),
      smallGroupName: text('td', { at: 3 }),
      errors: text('td', { at: 4 }),
    },
  }),
  showConfirmUploadButton: isVisible('[data-test-upload-data-confirm]'),
  confirmUploadedUsers: clickable('[data-test-upload-data-confirm]'),

  groupsToMatch: collection({
    itemScope: '[data-test-match-groups-unmatched] tbody tr',
    item: {
      name: text('[data-test-group-name]', { scope: 'td:eq(0)' }),
      createNewGroup: clickable('[data-test-create-group]', { scope: 'td:eq(0)' }),
      chooseGroup: fillable('td:eq(1) select'),
      selected: text('td:eq(1) select option:selected'),
    },
  }),

  finalData: collection({
    itemScope: '[data-test-final-data] tbody tr',
    item: {
      user: {
        scope: 'td:eq(0)',
        userNameInfo,
      },
      campusId: text('td', { at: 1 }),
      groupName: text('td', { at: 2 }),
    },
  }),

  finalErrorData: collection({
    itemScope: '[data-test-final-error-data] tbody tr',
    item: {
      user: {
        scope: 'td:eq(0)',
        userNameInfo,
      },
      campusId: text('td', { at: 1 }),
      error: text('td', { at: 2 }),
    },
  }),

  canSubmitFinalData: isVisible('[data-test-finalize-users-submit]'),
  submitFinalData: clickable('[data-test-finalize-users-submit]'),
};

export default definition;
export const component = create(definition);
