import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { component } from 'ilios-common/page-objects/components/user-name-info';
import { setupMirage } from 'test-app/tests/test-support/mirage';
import UserNameInfo from 'ilios-common/components/user-name-info';

module('Integration | Component | user-name-info', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function (assert) {
    const user = this.server.create('user');
    const userModel = await this.owner.lookup('service:store').findRecord('user', user.id);
    this.set('user', userModel);
    await render(<template><UserNameInfo @user={{this.user}} /></template>);
    assert.notOk(component.hasAdditionalInfo);
    assert.notOk(component.hasPronouns);
    assert.strictEqual(component.fullName, '0 guy M. Mc0son');
  });

  test('it renders with additional info when configured to do so', async function (assert) {
    const user = this.server.create('user', { displayName: 'Clem Chowder' });
    const userModel = await this.owner.lookup('service:store').findRecord('user', user.id);
    this.set('user', userModel);
    await render(<template><UserNameInfo @user={{this.user}} /></template>);
    assert.ok(component.hasAdditionalInfo);
    assert.strictEqual(component.fullName, 'Clem Chowder');
    assert.strictEqual(component.infoIconLabel, 'Campus name of record');
    assert.notOk(component.isTooltipVisible);
    await component.expandTooltip();
    assert.ok(component.isTooltipVisible);
    assert.strictEqual(component.tooltipContents, 'Campus name of record: 0 guy M, Mc0son');
    await component.closeTooltip();
    assert.notOk(component.isTooltipVisible);
  });

  test('it hides additional info when configured to do so', async function (assert) {
    this.server.get('application/config', function () {
      return {
        config: {
          showCampusNameOfRecord: false,
        },
      };
    });
    const user = this.server.create('user', { displayName: 'Clem Chowder' });
    const userModel = await this.owner.lookup('service:store').findRecord('user', user.id);
    this.set('user', userModel);
    await render(<template><UserNameInfo @user={{this.user}} /></template>);
    assert.notOk(component.hasAdditionalInfo);
    assert.strictEqual(component.fullName, 'Clem Chowder');
  });

  test('passing in id as an attributes', async function (assert) {
    const user = this.server.create('user');
    const userModel = await this.owner.lookup('service:store').findRecord('user', user.id);
    this.set('user', userModel);
    await render(<template><UserNameInfo id="test-id" @user={{this.user}} /></template>);
    assert.strictEqual(component.id, 'test-id');
  });

  test('pronouns display if present', async function (assert) {
    const user = this.server.create('user', {
      pronouns: 'they/them/tay',
    });
    const userModel = await this.owner.lookup('service:store').findRecord('user', user.id);
    this.set('user', userModel);
    await render(<template><UserNameInfo @user={{this.user}} /></template>);
    assert.ok(component.hasPronouns);
    assert.strictEqual(component.fullName, '0 guy M. Mc0son');
    assert.strictEqual(component.pronouns, '(they/them/tay)');
  });
});
