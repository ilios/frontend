import { clickable, create, property, text, visitable } from 'ember-cli-page-object';
import bioDetails from 'frontend/tests/pages/components/user-profile-bio-details';
import cohorts from 'frontend/tests/pages/components/user-profile-cohorts';
import manageUsersSummary from 'frontend/tests/pages/components/manage-users-summary';

export default create({
  scope: '[data-test-user-profile]',
  visit: visitable('/users/:userId'),
  manageUsersSummary,
  bioDetails,
  cohorts,
  roles: {
    scope: '[data-test-user-profile-roles]',
    manage: clickable('[data-test-manage]'),
    save: clickable('[data-test-save]'),
    student: {
      scope: '.item:nth-of-type(1)',
      label: text('label'),
      value: text('.value'),
    },
    formerStudent: {
      scope: '.item:nth-of-type(2)',
      label: text('label'),
      value: text('.value'),
      selected: property('checked', 'input'),
      click: clickable('input'),
    },
    enabled: {
      scope: '.item:nth-of-type(3)',
      label: text('label'),
      value: text('.value'),
      selected: property('checked', 'input'),
      click: clickable('input'),
    },
    excludeFromSync: {
      scope: '.item:nth-of-type(4)',
      label: text('label'),
      value: text('.value'),
      selected: property('checked', 'input'),
      click: clickable('input'),
    },
  },
});
