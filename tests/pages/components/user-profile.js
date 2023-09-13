import { create } from 'ember-cli-page-object';

import bio from 'ilios/tests/pages/components/user-profile-bio';
import calendar from 'ilios/tests/pages/components/user-profile-calendar';
import cohorts from 'ilios/tests/pages/components/user-profile-cohorts';
import ics from 'ilios/tests/pages/components/user-profile-ics';
import learnerGroups from 'ilios/tests/pages/components/user-profile/learner-groups';
import permissions from 'ilios/tests/pages/components/user-profile-permissions';
import roles from 'ilios/tests/pages/components/user-profile-roles';
import toggleButtons from 'ilios-common/page-objects/components/toggle-buttons';

// @todo flesh this out. [ST 2023/09/08]
const definition = {
  scope: '[data-test-user-profile]',
  actions: {
    scope: '[data-test-user-profile-actions]',
    calendarToggle: toggleButtons,
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
