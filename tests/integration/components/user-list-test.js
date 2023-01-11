import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { component } from 'ilios/tests/pages/components/user-list';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Integration | Component | user list', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  test('it renders', async function (assert) {
    const school = this.server.create('school');
    const user1 = this.server.create('user', {
      firstName: 'Foo',
      lastName: 'Bar',
      displayName: 'Aardvark',
      enabled: false,
      school,
      email: 'aardvark@test.edu',
      campusId: '1112222',
    });
    const user2 = this.server.create('user', { school });
    const userModel1 = await this.owner.lookup('service:store').findRecord('user', user1.id);
    const userModel2 = await this.owner.lookup('service:store').findRecord('user', user2.id);
    this.set('users', [userModel1, userModel2]);
    await render(hbs`<UserList @users={{this.users}} />`);
    assert.strictEqual(component.users.length, 2);
    assert.ok(component.users[0].isDisabled);
    assert.ok(component.users[0].disabledUserIcon.isVisible);
    assert.ok(component.users[0].userNameInfo.hasAdditionalInfo);
    assert.strictEqual(component.users[0].userNameInfo.fullName, 'Aardvark');
    assert.strictEqual(component.users[0].campusId.text, '1112222');
    assert.strictEqual(component.users[0].email.text, 'aardvark@test.edu');
    assert.strictEqual(component.users[0].school.text, 'school 0');
    assert.notOk(component.users[1].isDisabled);
    assert.notOk(component.users[1].disabledUserIcon.isVisible);
    assert.notOk(component.users[1].userNameInfo.hasAdditionalInfo);
    assert.strictEqual(component.users[1].userNameInfo.fullName, '1 guy M. Mc1son');
    assert.strictEqual(component.users[1].campusId.text, '1abc');
    assert.strictEqual(component.users[1].email.text, 'user@example.edu');
    assert.strictEqual(component.users[1].school.text, 'school 0');
  });
});
