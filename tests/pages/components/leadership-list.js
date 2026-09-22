import { collection, create } from 'ember-cli-page-object';
import userNameInfo from 'ilios-common/page-objects/components/user-name-info';
import userStatus from 'ilios-common/page-objects/components/user-status';

const definition = {
  scope: '[data-test-leadership-list]',
  directors: collection('[data-test-directors] ul li', {
    userNameInfo,
    userStatus,
  }),
  administrators: collection('[data-test-administrators] ul li', {
    userNameInfo,
    userStatus,
  }),
  studentAdvisors: collection('[data-test-student-advisors] ul li', {
    userNameInfo,
    userStatus,
  }),
};

export default definition;
export const component = create(definition);
