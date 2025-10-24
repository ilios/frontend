import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { setupMirage } from 'test-app/tests/test-support/mirage';
import { component } from 'ilios-common/page-objects/components/leadership-search';
import LeadershipSearch from 'ilios-common/components/leadership-search';
import { array } from '@ember/helper';
import noop from 'ilios-common/helpers/noop';

module('Integration | Component | leadership-search', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('less than 3 characters triggers warning', async function (assert) {
    await render(
      <template><LeadershipSearch @existingUsers={{(array)}} @selectUser={{(noop)}} /></template>,
    );
    await component.search('ab');
    assert.strictEqual(component.results.length, 1);
    assert.strictEqual(component.results[0].text, 'keep typing...');
  });

  test('input triggers search', async function (assert) {
    this.server.create('user', {
      firstName: 'test',
      lastName: 'person',
      email: 'testemail',
    });
    await render(
      <template><LeadershipSearch @existingUsers={{(array)}} @selectUser={{(noop)}} /></template>,
    );

    await component.search('test person');
    assert.strictEqual(component.results.length, 2);
    assert.ok(component.results[0].isSummary);
    assert.strictEqual(component.results[0].text, '1 result');
    assert.ok(component.results[1].isUser);
    assert.notOk(component.results[1].isInactive);
    assert.strictEqual(component.results[1].name.fullName, 'test M. person');
    assert.notOk(component.results[1].name.userStatus.accountIsDisabled);
    assert.strictEqual(component.results[1].email, 'testemail');

    // Check that special characters do not mess things up.
    await component.search('test?person');
    assert.strictEqual(component.results.length, 2);
    assert.ok(component.results[0].isSummary);
    assert.strictEqual(component.results[0].text, '1 result');
    assert.strictEqual(component.results[1].name.fullName, 'test M. person');

    // Check that multiple special characters do not mess things up.
    await component.search('test"person"');
    assert.strictEqual(component.results.length, 2);
    assert.ok(component.results[0].isSummary);
    assert.strictEqual(component.results[0].text, '1 result');
    assert.strictEqual(component.results[1].name.fullName, 'test M. person');
  });

  test('no results displays messages', async function (assert) {
    await render(
      <template><LeadershipSearch @existingUsers={{(array)}} @selectUser={{(noop)}} /></template>,
    );

    await component.search('search words');
    assert.strictEqual(component.results.length, 1);
    assert.strictEqual(component.results[0].text, 'no results');
  });

  test('click user fires add user', async function (assert) {
    this.server.create('user', {
      firstName: 'test',
      lastName: 'person',
      email: 'testemail',
    });
    this.set('select', (user) => {
      assert.step('select called');
      assert.strictEqual(parseInt(user.id, 10), 1);
    });
    await render(
      <template>
        <LeadershipSearch @existingUsers={{(array)}} @selectUser={{this.select}} />
      </template>,
    );

    await component.search('test');
    assert.strictEqual(component.results[1].name.fullName, 'test M. person');
    await component.results[1].select();
    assert.verifySteps(['select called']);
  });

  test('can not add users twice', async function (assert) {
    this.server.create('user', {
      firstName: 'test',
      lastName: 'person',
      email: 'testemail',
    });
    this.server.create('user', {
      firstName: 'test',
      lastName: 'person2',
      email: 'testemail2',
    });
    this.set('select', (user) => {
      assert.step('select called');
      assert.strictEqual(parseInt(user.id, 10), 2, 'only user2 should be sent here');
    });
    const user1 = await this.owner.lookup('service:store').findRecord('user', 1);

    this.set('existingUsers', [user1]);
    await render(
      <template>
        <LeadershipSearch @existingUsers={{this.existingUsers}} @selectUser={{this.select}} />
      </template>,
    );

    await component.search('test');
    assert.strictEqual(component.results.length, 3);
    assert.strictEqual(component.results[0].text, '2 results');
    assert.ok(component.results[1].isInactive);
    assert.notOk(component.results[1].isClickable);
    assert.strictEqual(component.results[1].name.fullName, 'test M. person');
    assert.notOk(component.results[2].isInactive);
    assert.ok(component.results[2].isClickable);
    assert.strictEqual(component.results[2].name.fullName, 'test M. person2');
    await component.results[2].select();
    assert.verifySteps(['select called']);
  });
});
