import { create } from 'ember-cli-page-object';
import bioDetails from 'frontend/tests/pages/components/user-profile-bio-details';
import bioManager from 'frontend/tests/pages/components/user-profile-bio-manager';

const definition = {
  scope: '[data-test-user-profile-bio]',
  userNameMissingError: {
    scope: '[data-test-username-missing]',
  },
  bioDetails,
  bioManager,
};

export default definition;
export const component = create(definition);
