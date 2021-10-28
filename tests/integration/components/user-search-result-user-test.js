import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Integration | Component | user-search-result-user', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function (assert) {
    this.server.create('user');
    const user = await this.owner.lookup('service:store').find('user', 1);
    this.set('user', user);
    await render(hbs`<UserSearchResultUser
      @user={{this.user}}
      @addUser={{(noop)}}
    />`);
    assert.dom('[data-test-result]').includesText('0 guy M. Mc0son user@example.edu');
    assert.dom('[data-test-result]').hasClass('active');
  });

  test('inactive if it is already selected', async function (assert) {
    this.server.create('user');
    const user = await this.owner.lookup('service:store').find('user', 1);
    this.set('user', user);
    await render(hbs`<UserSearchResultUser
      @user={{this.user}}
      @addUser={{(noop)}}
      @currentlyActiveUsers={{array this.user}}
    />`);
    assert.dom('[data-test-result]').includesText('0 guy M. Mc0son user@example.edu');
    assert.dom('[data-test-result]').hasClass('inactive');
  });

  test('click fires action', async function (assert) {
    assert.expect(3);
    this.server.create('user');
    const user = await this.owner.lookup('service:store').find('user', 1);
    this.set('user', user);
    this.set('add', (add) => {
      assert.strictEqual(add, user);
    });
    await render(hbs`<UserSearchResultUser
      @user={{this.user}}
      @addUser={{this.add}}
      @currentlyActiveUsers={{array}}
    />`);
    assert.dom('[data-test-result]').includesText('0 guy M. Mc0son user@example.edu');
    assert.dom('[data-test-result]').hasClass('active');
    await click('[data-test-result]');
  });
});
