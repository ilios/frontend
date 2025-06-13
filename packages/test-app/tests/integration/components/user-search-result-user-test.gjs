import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { setupMirage } from 'test-app/tests/test-support/mirage';
import { component } from 'ilios-common/page-objects/components/user-search-result';
import UserSearchResultUser from 'ilios-common/components/user-search-result-user';
import noop from 'ilios-common/helpers/noop';
import { array } from '@ember/helper';

module('Integration | Component | user-search-result-user', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function (assert) {
    const user = this.server.create('user');
    const userModel = await this.owner.lookup('service:store').findRecord('user', user.id);
    this.set('user', userModel);
    await render(
      <template><UserSearchResultUser @user={{this.user}} @addUser={{(noop)}} /></template>,
    );
    assert.strictEqual(component.text, '0 guy M. Mc0son user@example.edu');
    assert.ok(component.isActive);
  });

  test('inactive if it is already selected', async function (assert) {
    const user = this.server.create('user');
    const userModel = await this.owner.lookup('service:store').findRecord('user', user.id);
    this.set('user', userModel);
    this.set('activeUsers', [userModel]);
    await render(
      <template>
        <UserSearchResultUser
          @user={{this.user}}
          @addUser={{(noop)}}
          @currentlyActiveUsers={{this.activeUsers}}
        />
      </template>,
    );
    assert.strictEqual(component.text, '0 guy M. Mc0son user@example.edu');
    assert.notOk(component.isActive);
  });

  test('add active user', async function (assert) {
    assert.expect(4);
    const user = this.server.create('user');
    const userModel = await this.owner.lookup('service:store').findRecord('user', user.id);
    this.set('user', userModel);
    this.set('add', (user) => {
      assert.strictEqual(user, userModel);
    });
    await render(
      <template>
        <UserSearchResultUser
          @user={{this.user}}
          @addUser={{this.add}}
          @currentlyActiveUsers={{(array)}}
        />
      </template>,
    );
    assert.strictEqual(component.text, '0 guy M. Mc0son user@example.edu');
    assert.notOk(component.userStatus.accountIsDisabled);
    assert.ok(component.isActive);
    await component.click();
  });

  test('cannot add inactive user by default', async function (assert) {
    const user = this.server.create('user', { enabled: false });
    const userModel = await this.owner.lookup('service:store').findRecord('user', user.id);
    this.set('user', userModel);
    await render(
      <template>
        <UserSearchResultUser
          @user={{this.user}}
          @addUser={{this.add}}
          @currentlyActiveUsers={{(array)}}
        />
      </template>,
    );
    assert.strictEqual(component.text, '0 guy M. Mc0son disabled user account user@example.edu');
    assert.ok(component.userStatus.accountIsDisabled);
    assert.notOk(component.isActive);
    assert.notOk(component.canAdd);
  });

  test('add inactive user if allowed', async function (assert) {
    assert.expect(5);
    const user = this.server.create('user', { enabled: false });
    const userModel = await this.owner.lookup('service:store').findRecord('user', user.id);
    this.set('user', userModel);
    this.set('add', (user) => {
      assert.strictEqual(user, userModel);
    });
    await render(
      <template>
        <UserSearchResultUser
          @user={{this.user}}
          @addUser={{this.add}}
          @currentlyActiveUsers={{(array)}}
          @canAddDisabledUser={{true}}
        />
      </template>,
    );
    assert.strictEqual(component.text, '0 guy M. Mc0son disabled user account user@example.edu');
    assert.ok(component.userStatus.accountIsDisabled);
    assert.ok(component.isActive);
    assert.ok(component.canAdd);
    await component.click();
  });
});
