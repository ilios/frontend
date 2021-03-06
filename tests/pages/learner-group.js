import {
  create,
  clickable,
  collection,
  fillable,
  hasClass,
  isVisible,
  text,
  visitable,
} from 'ember-cli-page-object';
import learnerGroupUserManager from './components/learnergroup-user-manager';
import learnergroupSubgroupList from './components/learnergroup-subgroup-list';
import userNameInfo from 'ilios-common/page-objects/components/user-name-info';

export default create({
  visit: visitable('/learnergroups/:learnerGroupId'),
  header: {
    scope: '[data-test-learnergroup-header]',
    members: text('[data-test-members]'),
  },
  overview: {
    scope: '[data-test-overview]',
    manage: clickable('[data-test-overview-actions] [data-test-manage]'),
    learnerGroupUserManager,
    calendarToggledHidden: isVisible(
      '[data-test-toggle-learnergroup-calendar] [data-test-first][data-test-selected]'
    ),
    calendarToggledVisible: isVisible(
      '[data-test-toggle-learnergroup-calendar] [data-test-second][data-test-selected]'
    ),
    hideCalendar: clickable('[data-test-toggle-learnergroup-calendar] [data-test-first]'),
    showCalendar: clickable('[data-test-toggle-learnergroup-calendar] [data-test-second]'),
    calendar: {
      scope: '[data-test-learnergroup-calendar]',
      toggleSubgroupEvents: clickable(
        '[data-test-learnergroup-calendar-toggle-subgroup-events] [data-test-toggle-yesno] [data-test-handle]'
      ),
      events: collection('[data-test-calendar-event]'),
    },
  },
  activateBulkAssign: clickable('[data-test-activate-bulk-assign]'),
  bulkAssign: {
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
  },
  subgroups: learnergroupSubgroupList,
  usersInCohort: {
    scope: '.cohortmembers',
    list: collection('tbody tr', {
      scope: '.list',
      name: {
        scope: 'td:eq(1)',
        userNameInfo,
      },
      campusId: text('td', { at: 2 }),
      email: text('td', { at: 3 }),
      add: clickable('.yes.clickable'),
    }),
  },
});
