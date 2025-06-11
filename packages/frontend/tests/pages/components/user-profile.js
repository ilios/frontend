import { create } from 'ember-cli-page-object';

import bio from 'frontend/tests/pages/components/user-profile-bio';
import calendar from 'frontend/tests/pages/components/user-profile-calendar';
import cohorts from 'frontend/tests/pages/components/user-profile-cohorts';
import ics from 'frontend/tests/pages/components/user-profile-ics';
import learnerGroups from 'frontend/tests/pages/components/user-profile/learner-groups';
import permissions from 'frontend/tests/pages/components/user-profile-permissions';
import roles from 'frontend/tests/pages/components/user-profile-roles';
import toggleButtons from 'ilios-common/page-objects/components/toggle-buttons';
import userNameInfo from 'ilios-common/page-objects//components/user-name-info';
import userStatus from 'ilios-common/page-objects/components/user-status';

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
