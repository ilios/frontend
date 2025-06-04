import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import { component } from 'frontend/tests/pages/components/ilios-users';
import IliosUsers from 'frontend/components/ilios-users';
import { array } from '@ember/helper';
import noop from 'ilios-common/helpers/noop';

module('Integration | Component | ilios users', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function (assert) {
    await render(
      <template>
        <IliosUsers
          @sortBy="fullName"
          @limit="25"
          @offset="25"
          @query=""
          @searchTerms={{(array)}}
          @setQuery={{(noop)}}
          @setLimit={{(noop)}}
          @setOffset={{(noop)}}
          @setShowNewUserForm={{(noop)}}
          @setShowBulkNewUserForm={{(noop)}}
          @setSearchTerms={{(noop)}}
          @transitionToUser={{(noop)}}
        />
      </template>,
    );
    assert.strictEqual(component.title.text, 'Users');
  });

  test('it shows/hides new user creation buttons depending on user permission', async function (assert) {
    this.set('canCreate', false);

    await render(
      <template>
        <IliosUsers
          @sortBy="fullName"
          @limit="25"
          @offset="25"
          @query=""
          @canCreate={{this.canCreate}}
          @searchTerms={{(array)}}
          @setQuery={{(noop)}}
          @setLimit={{(noop)}}
          @setOffset={{(noop)}}
          @setShowNewUserForm={{(noop)}}
          @setShowBulkNewUserForm={{(noop)}}
          @setSearchTerms={{(noop)}}
          @transitionToUser={{(noop)}}
        />
      </template>,
    );

    assert.notOk(component.showNewUserFormButton.isVisible);
    assert.notOk(component.showBulkUsersFormButton.isVisible);

    this.set('canCreate', true);

    assert.ok(component.showNewUserFormButton.isVisible);
    assert.ok(component.showBulkUsersFormButton.isVisible);
  });

  test('param passing', async function (assert) {
    assert.expect(2);

    const value = 'nothing';
    const newValue = 'test';
    this.set('value', value);
    this.set('setQuery', (query) => {
      assert.strictEqual(query, newValue);
    });
    await render(
      <template>
        <IliosUsers
          @sortBy="fullName"
          @limit="25"
          @offset="25"
          @query={{this.value}}
          @searchTerms={{(array)}}
          @setQuery={{this.setQuery}}
          @setLimit={{(noop)}}
          @setOffset={{(noop)}}
          @setShowNewUserForm={{(noop)}}
          @setShowBulkNewUserForm={{(noop)}}
          @setSearchTerms={{(noop)}}
          @transitionToUser={{(noop)}}
        />
      </template>,
    );

    assert.strictEqual(component.search.value, value);
    await component.search.set(newValue);
  });

  test('add user form renders when configured to', async function (assert) {
    const { apiVersion } = this.owner.resolveRegistration('config:environment');
    assert.ok(apiVersion);
    this.server.get('application/config', function () {
      return {
        config: {
          type: 'form',
          userSearchType: 'form',
          apiVersion,
        },
      };
    });
    const school = this.server.create('school');
    const user = this.server.create('user', {
      school,
    });
    const userModel = await this.owner.lookup('service:store').findRecord('user', user.id);

    class CurrentUserMock extends Service {
      async getModel() {
        return userModel;
      }
      getRolesInSchool() {
        return [];
      }
    }

    this.owner.register('service:current-user', CurrentUserMock);

    await render(
      <template>
        <IliosUsers
          @sortBy="fullName"
          @showNewUserForm={{true}}
          @searchTerms={{(array)}}
          @setQuery={{(noop)}}
          @setLimit={{(noop)}}
          @setOffset={{(noop)}}
          @setShowNewUserForm={{(noop)}}
          @setShowBulkNewUserForm={{(noop)}}
          @setSearchTerms={{(noop)}}
          @transitionToUser={{(noop)}}
        />
      </template>,
    );
    assert.ok(component.newUserForm.isPresent, 'the new user form is present');
    assert.notOk(
      component.newDirectoryUserForm.isPresent,
      'the new directory user form is not present',
    );
  });

  test('directory search renders when configured to', async function (assert) {
    const { apiVersion } = this.owner.resolveRegistration('config:environment');
    assert.ok(apiVersion);
    this.server.get('application/config', function () {
      return {
        config: {
          type: 'form',
          userSearchType: 'ldap',
          apiVersion,
        },
      };
    });

    const school = this.server.create('school');
    const user = this.server.create('user', {
      school,
    });
    const userModel = await this.owner.lookup('service:store').findRecord('user', user.id);

    class CurrentUserMock extends Service {
      async getModel() {
        return userModel;
      }
      getRolesInSchool() {
        return [];
      }
    }

    this.owner.register('service:current-user', CurrentUserMock);

    await render(
      <template>
        <IliosUsers
          @sortBy="fullName"
          @showNewUserForm={{true}}
          @searchTerms={{(array)}}
          @setQuery={{(noop)}}
          @setLimit={{(noop)}}
          @setOffset={{(noop)}}
          @setShowNewUserForm={{(noop)}}
          @setShowBulkNewUserForm={{(noop)}}
          @setSearchTerms={{(noop)}}
          @transitionToUser={{(noop)}}
        />
      </template>,
    );
    assert.notOk(component.newUserForm.isPresent, 'the new user form is not present');
    assert.ok(component.newDirectoryUserForm.isPresent, 'the new directory form is present');
  });

  test('close bulk new users form callback fires', async function (assert) {
    assert.expect(1);
    const { apiVersion } = this.owner.resolveRegistration('config:environment');
    this.server.get('application/config', function () {
      return {
        config: {
          type: 'form',
          userSearchType: 'form',
          apiVersion,
        },
      };
    });
    const school = this.server.create('school');
    const user = this.server.create('user', {
      school,
    });
    const userModel = await this.owner.lookup('service:store').findRecord('user', user.id);

    class CurrentUserMock extends Service {
      async getModel() {
        return userModel;
      }
      getRolesInSchool() {
        return [];
      }
    }

    this.owner.register('service:current-user', CurrentUserMock);

    this.set('setShowBulkNewUserForm', (value) => {
      assert.notOk(value);
    });
    await render(
      <template>
        <IliosUsers
          @sortBy="fullName"
          @showBulkNewUserForm={{true}}
          @searchTerms={{(array)}}
          @setQuery={{(noop)}}
          @setLimit={{(noop)}}
          @setOffset={{(noop)}}
          @setShowNewUserForm={{(noop)}}
          @setShowBulkNewUserForm={{this.setShowBulkNewUserForm}}
          @setSearchTerms={{(noop)}}
          @transitionToUser={{(noop)}}
        />
      </template>,
    );
    await component.newBulkUserForm.cancel();
  });

  test('close new user form callback fires', async function (assert) {
    assert.expect(1);
    const { apiVersion } = this.owner.resolveRegistration('config:environment');
    this.server.get('application/config', function () {
      return {
        config: {
          type: 'form',
          userSearchType: 'form',
          apiVersion,
        },
      };
    });
    const school = this.server.create('school');
    const user = this.server.create('user', {
      school,
    });
    const userModel = await this.owner.lookup('service:store').findRecord('user', user.id);

    class CurrentUserMock extends Service {
      async getModel() {
        return userModel;
      }
      getRolesInSchool() {
        return [];
      }
    }

    this.owner.register('service:current-user', CurrentUserMock);
    this.set('setShowNewUserForm', (value) => {
      assert.notOk(value);
    });
    await render(
      <template>
        <IliosUsers
          @sortBy="fullName"
          @showNewUserForm={{true}}
          @searchTerms={{(array)}}
          @setQuery={{(noop)}}
          @setLimit={{(noop)}}
          @setOffset={{(noop)}}
          @setShowNewUserForm={{this.setShowNewUserForm}}
          @setShowBulkNewUserForm={{(noop)}}
          @setSearchTerms={{(noop)}}
          @transitionToUser={{(noop)}}
        />
      </template>,
    );
    await component.newUserForm.cancel();
  });

  test('collapse button fires', async function (assert) {
    assert.expect(1);
    assert.expect(1);
    const { apiVersion } = this.owner.resolveRegistration('config:environment');
    this.server.get('application/config', function () {
      return {
        config: {
          type: 'form',
          userSearchType: 'form',
          apiVersion,
        },
      };
    });
    const school = this.server.create('school');
    const user = this.server.create('user', {
      school,
    });
    const userModel = await this.owner.lookup('service:store').findRecord('user', user.id);

    class CurrentUserMock extends Service {
      async getModel() {
        return userModel;
      }
      getRolesInSchool() {
        return [];
      }
    }

    this.owner.register('service:current-user', CurrentUserMock);

    this.set('setShowBulkNewUserForm', (value) => {
      assert.notOk(value);
    });
    await render(
      <template>
        <IliosUsers
          @sortBy="fullName"
          @canCreate={{true}}
          @showBulkNewUserForm={{true}}
          @searchTerms={{(array)}}
          @setQuery={{(noop)}}
          @setLimit={{(noop)}}
          @setOffset={{(noop)}}
          @setShowNewUserForm={{(noop)}}
          @setShowBulkNewUserForm={{this.setShowBulkNewUserForm}}
          @setSearchTerms={{(noop)}}
          @transitionToUser={{(noop)}}
        />
      </template>,
    );
    await component.collapseForm();
  });
});
