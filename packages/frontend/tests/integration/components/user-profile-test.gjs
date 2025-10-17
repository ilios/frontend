import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import Service from '@ember/service';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import { component } from 'frontend/tests/pages/components/user-profile';
import UserProfile from 'frontend/components/user-profile';
import noop from 'ilios-common/helpers/noop';

module('Integration | Component | user-profile', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const school = this.server.create('school');
    const program = this.server.create('program', { school });
    this.programYear = this.server.create('program-year', { program });
    this.cohort = this.server.create('cohort', { programYear: this.programYear });

    const user = this.server.create('user', { school });
    const userModel = await this.owner.lookup('service:store').findRecord('user', user.id);
    class CurrentUserMock extends Service {
      async getModel() {
        return userModel;
      }
      getRolesInSchool() {
        return [];
      }
    }
    this.owner.register('service:currentUser', CurrentUserMock);
  });

  test('profile title - enabled user account', async function (assert) {
    const user = this.server.create('user');
    const userModel = await this.owner.lookup('service:store').findRecord('user', user.id);
    this.set('user', userModel);

    await render(
      <template>
        <UserProfile
          @user={{this.user}}
          @canUpdate={{false}}
          @canCreate={{false}}
          @isManagingBio={{false}}
          @setIsManagingBio={{(noop)}}
          @isManagingRoles={{false}}
          @setIsManagingRoles={{(noop)}}
          @isManagingCohorts={{false}}
          @setIsManagingCohorts={{(noop)}}
          @isManagingIcs={{false}}
          @setIsManagingIcs={{(noop)}}
          @isManagingSchools={{false}}
          @setIsManagingSchools={{(noop)}}
          @permissionsSchool={{null}}
          @permissionsYear={{null}}
          @setPermissionsSchool={{(noop)}}
          @setPermissionsYear={{(noop)}}
        />
      </template>,
    );

    assert.strictEqual(component.title.userNameInfo.fullName, '1 guy M. Mc1son');
    assert.notOk(component.title.userStatus.accountIsDisabled);
  });

  test('profile title - disabled user account', async function (assert) {
    const user = this.server.create('user', { enabled: false });
    const userModel = await this.owner.lookup('service:store').findRecord('user', user.id);
    this.set('user', userModel);

    await render(
      <template>
        <UserProfile
          @user={{this.user}}
          @canUpdate={{false}}
          @canCreate={{false}}
          @isManagingBio={{false}}
          @setIsManagingBio={{(noop)}}
          @isManagingRoles={{false}}
          @setIsManagingRoles={{(noop)}}
          @isManagingCohorts={{false}}
          @setIsManagingCohorts={{(noop)}}
          @isManagingIcs={{false}}
          @setIsManagingIcs={{(noop)}}
          @isManagingSchools={{false}}
          @setIsManagingSchools={{(noop)}}
          @permissionsSchool={{null}}
          @permissionsYear={{null}}
          @setPermissionsSchool={{(noop)}}
          @setPermissionsYear={{(noop)}}
        />
      </template>,
    );

    assert.strictEqual(component.title.userNameInfo.fullName, '1 guy M. Mc1son');
    assert.ok(component.title.userStatus.accountIsDisabled);
  });

  test('user profile calendar', async function (assert) {
    const user = this.server.create('user');
    const userModel = await this.owner.lookup('service:store').findRecord('user', user.id);
    this.set('user', userModel);
    this.set('showCalendar', false);
    this.set('setShowCalendar', () => {
      this.set('showCalendar', !this.showCalendar);
    });

    await render(
      <template>
        <UserProfile
          @user={{this.user}}
          @canUpdate={{false}}
          @canCreate={{false}}
          @showCalendar={{this.showCalendar}}
          @setShowCalendar={{this.setShowCalendar}}
          @isManagingBio={{false}}
          @setIsManagingBio={{(noop)}}
          @isManagingRoles={{false}}
          @setIsManagingRoles={{(noop)}}
          @isManagingCohorts={{false}}
          @setIsManagingCohorts={{(noop)}}
          @isManagingIcs={{false}}
          @setIsManagingIcs={{(noop)}}
          @isManagingSchools={{false}}
          @setIsManagingSchools={{(noop)}}
          @permissionsSchool={{null}}
          @permissionsYear={{null}}
          @setPermissionsSchool={{(noop)}}
          @setPermissionsYear={{(noop)}}
        />
      </template>,
    );

    assert.notOk(component.calendar.isVisible, 'calendar is not visible');
    assert.strictEqual(
      component.actions.calendarToggle.firstLabel.text,
      'Hide Calendar',
      'first toggle button label is correct',
    );
    assert.ok(
      component.actions.calendarToggle.firstButton.isChecked,
      'first toggle button is checked',
    );
    assert.strictEqual(
      component.actions.calendarToggle.secondLabel.text,
      'Show Calendar',
      'second toggle button label is correct',
    );
    assert.notOk(
      component.actions.calendarToggle.secondButton.isChecked,
      'second toggle button is not checked',
    );
    await component.actions.calendarToggle.secondButton.click();
    assert.ok(component.calendar.isVisible, 'calendar is visible after toggle');
    await component.actions.calendarToggle.firstButton.click();
    assert.notOk(component.calendar.isVisible, 'calendar is not visible after toggle');
  });
});
