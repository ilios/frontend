import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { component } from 'ilios-common/page-objects/components/user-search-result';

module('Integration | Component | user-search-result-user', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  test('it renders', async function (assert) {
    const user = this.server.create('user');
    const userModel = await this.owner.lookup('service:store').findRecord('user', user.id);
    this.set('user', userModel);
    await render(hbs`<UserSearchResultUser
      @user={{this.user}}
      @addUser={{(noop)}}
    />`);
    assert.strictEqual(component.text, '0 guy M. Mc0son user@example.edu');
    assert.ok(component.isActive);
  });

  test('inactive if it is already selected', async function (assert) {
    const user = this.server.create('user');
    const userModel = await this.owner.lookup('service:store').findRecord('user', user.id);
    this.set('user', userModel);
    this.set('activeUsers', [userModel]);
    await render(hbs`<UserSearchResultUser
      @user={{this.user}}
      @addUser={{(noop)}}
      @currentlyActiveUsers={{this.activeUsers}}
    />`);
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
    await render(hbs`<UserSearchResultUser
      @user={{this.user}}
      @addUser={{this.add}}
      @currentlyActiveUsers={{(array)}}
    />`);
    assert.strictEqual(component.text, '0 guy M. Mc0son user@example.edu');
    assert.ok(component.isActive);
    await component.click();
  });
});
