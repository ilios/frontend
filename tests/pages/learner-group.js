import { create, clickable, collection, text, visitable } from 'ember-cli-page-object';
import learnerGroupUserManager from './components/learnergroup-user-manager';
import learnergroupSubgroupList from './components/learnergroup-subgroup-list';
import bulkAssign from './components/learnergroup-bulk-assign';
import userNameInfo from 'ilios-common/page-objects/components/user-name-info';
import displayToggle from 'ilios-common/page-objects/components/toggle-buttons';

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
    displayToggle,
    calendar: {
      scope: '[data-test-learnergroup-calendar]',
      toggleSubgroupEvents: clickable(
        '[data-test-learnergroup-calendar-toggle-subgroup-events] [data-test-toggle-yesno] [data-test-handle]'
      ),
      events: collection('[data-test-calendar-event]'),
    },
  },
  activateBulkAssign: clickable('[data-test-activate-bulk-assign]'),
  bulkAssign,
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
      add: clickable('[data-test-add-user]'),
    }),
  },
});
