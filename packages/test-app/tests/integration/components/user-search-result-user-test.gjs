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

  test('click fires action', async function (assert) {
    assert.expect(3);
    const user = this.server.create('user');
    const userModel = await this.owner.lookup('service:store').findRecord('user', user.id);
    this.set('user', userModel);
    this.set('add', (add) => {
      assert.strictEqual(add, userModel);
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
    assert.ok(component.isActive);
    await component.click();
  });
});
