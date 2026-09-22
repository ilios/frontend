import { create } from 'ember-cli-page-object';

import bio from './user-profile-bio';
import calendar from './user-profile-calendar';
import cohorts from './user-profile-cohorts';
import ics from './user-profile-ics';
import learnerGroups from './user-profile/learner-groups';
import permissions from './user-profile-permissions';
import roles from './user-profile-roles';
import toggleButtons from 'frontend/tests/pages/components/toggle-buttons';
import userNameInfo from 'frontend/tests/pages//components/user-name-info';
import userStatus from 'frontend/tests/pages/components/user-status';

// @todo flesh this out. [ST 2023/09/08]
const definition = {
  scope: '[data-test-user-profile]',
  actions: {
    scope: '[data-test-user-profile-actions]',
    calendarToggle: toggleButtons,
  },
  title: {
    scope: '[data-test-user-profile-title]',
    userNameInfo,
    userStatus,
  },
  bio,
  calendar,
  cohorts,
  learnerGroups,
  ics,
  permissions,
  roles,
};

export default definition;
export const component = create(definition);
