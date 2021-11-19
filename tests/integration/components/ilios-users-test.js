import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { component } from 'ilios/tests/pages/components/ilios-users';

module('Integration | Component | ilios users', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  test('it renders', async function (assert) {
    await render(hbs`<IliosUsers
      @limit=25
      @offset=25
      @query=""
      @searchTerms={{(array)}}
      @setQuery={{(noop)}}
      @setLimit={{(noop)}}
      @setOffset={{(noop)}}
      @setShowNewUserForm={{(noop)}}
      @setShowBulkNewUserForm={{(noop)}}
      @setSearchTerms={{(noop)}}
      @transitionToUser={{(noop)}}
    />`);
    assert.strictEqual(component.title.text, 'Users');
  });

  test('param passing', async function (assert) {
    assert.expect(2);

    const value = 'nothing';
    const newValue = 'test';
    this.set('value', value);
    this.set('setQuery', (query) => {
      assert.strictEqual(query, newValue);
    });
    await render(hbs`<IliosUsers
      @limit=25
      @offset=25
      @query={{this.value}}
      @searchTerms={{(array)}}
      @setQuery={{this.setQuery}}
      @setLimit={{(noop)}}
      @setOffset={{(noop)}}
      @setShowNewUserForm={{(noop)}}
      @setShowBulkNewUserForm={{(noop)}}
      @setSearchTerms={{(noop)}}
      @transitionToUser={{(noop)}}
    />`);

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
    const userModel = await this.owner.lookup('service:store').find('user', user.id);

    class CurrentUserMock extends Service {
      async getModel() {
        return userModel;
      }
      getRolesInSchool() {
        return [];
      }
    }

    this.owner.register('service:current-user', CurrentUserMock);

    await render(hbs`<IliosUsers
      @showNewUserForm={{true}}
      @searchTerms={{(array)}}
      @setQuery={{(noop)}}
      @setLimit={{(noop)}}
      @setOffset={{(noop)}}
      @setShowNewUserForm={{(noop)}}
      @setShowBulkNewUserForm={{(noop)}}
      @setSearchTerms={{(noop)}}
      @transitionToUser={{(noop)}}
    />`);
    assert.ok(component.newUserForm.isPresent, 'the new user form is present');
    assert.notOk(
      component.newDirectoryUserForm.isPresent,
      'the new directory user form is not present'
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
    const userModel = await this.owner.lookup('service:store').find('user', user.id);

    class CurrentUserMock extends Service {
      async getModel() {
        return userModel;
      }
      getRolesInSchool() {
        return [];
      }
    }

    this.owner.register('service:current-user', CurrentUserMock);

    await render(hbs`<IliosUsers
      @showNewUserForm={{true}}
      @searchTerms={{(array)}}
      @setQuery={{(noop)}}
      @setLimit={{(noop)}}
      @setOffset={{(noop)}}
      @setShowNewUserForm={{(noop)}}
      @setShowBulkNewUserForm={{(noop)}}
      @setSearchTerms={{(noop)}}
      @transitionToUser={{(noop)}}
    />`);
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
    const userModel = await this.owner.lookup('service:store').find('user', user.id);

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
    await render(hbs`<IliosUsers
      @showBulkNewUserForm={{true}}
      @searchTerms={{(array)}}
      @setQuery={{(noop)}}
      @setLimit={{(noop)}}
      @setOffset={{(noop)}}
      @setShowNewUserForm={{(noop)}}
      @setShowBulkNewUserForm={{this.setShowBulkNewUserForm}}
      @setSearchTerms={{(noop)}}
      @transitionToUser={{(noop)}}
    />`);
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
    const userModel = await this.owner.lookup('service:store').find('user', user.id);

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
    await render(hbs`<IliosUsers
      @showNewUserForm={{true}}
      @searchTerms={{(array)}}
      @setQuery={{(noop)}}
      @setLimit={{(noop)}}
      @setOffset={{(noop)}}
      @setShowNewUserForm={{this.setShowNewUserForm}}
      @setShowBulkNewUserForm={{(noop)}}
      @setSearchTerms={{(noop)}}
      @transitionToUser={{(noop)}}
    />`);
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
    const userModel = await this.owner.lookup('service:store').find('user', user.id);

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
    await render(hbs`<IliosUsers
      @showBulkNewUserForm={{true}}
      @searchTerms={{(array)}}
      @setQuery={{(noop)}}
      @setLimit={{(noop)}}
      @setOffset={{(noop)}}
      @setShowNewUserForm={{(noop)}}
      @setShowBulkNewUserForm={{this.setShowBulkNewUserForm}}
      @setSearchTerms={{(noop)}}
      @transitionToUser={{(noop)}}
    />`);
    await component.collapseForm();
  });
});
