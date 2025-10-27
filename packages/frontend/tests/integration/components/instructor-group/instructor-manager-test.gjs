import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import { render } from '@ember/test-helpers';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { component } from 'frontend/tests/pages/components/instructor-group/instructor-manager';
import InstructorManager from 'frontend/components/instructor-group/instructor-manager';
import noop from 'ilios-common/helpers/noop';

module('Integration | Component | instructor-group/instructor-manager', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const user1 = this.server.create('user');
    const user2 = this.server.create('user', { displayName: 'Aaron Aardvark', enabled: false });
    const user3 = this.server.create('user');
    const store = this.owner.lookup('service:store');
    this.user1 = await store.findRecord('user', user1.id);
    this.user2 = await store.findRecord('user', user2.id);
    this.user3 = await store.findRecord('user', user3.id);
  });

  test('it renders', async function (assert) {
    const instructors = [this.user1, this.user2, this.user3];
    this.set('instructors', instructors);
    await render(
      <template>
        <InstructorManager @instructors={{this.instructors}} @add={{(noop)}} @remove={{(noop)}} />
      </template>,
    );
    assert.strictEqual(component.selectedInstructors.label, 'Selected Instructors:');
    assert.strictEqual(component.selectedInstructors.users.length, 3);
    assert.strictEqual(
      component.selectedInstructors.users[0].userNameInfo.fullName,
      '0 guy M. Mc0son',
    );
    assert.notOk(component.selectedInstructors.users[0].userStatus.accountIsDisabled);
    assert.strictEqual(
      component.selectedInstructors.users[1].userNameInfo.fullName,
      '2 guy M. Mc2son',
    );
    assert.notOk(component.selectedInstructors.users[1].userStatus.accountIsDisabled);
    assert.strictEqual(
      component.selectedInstructors.users[2].userNameInfo.fullName,
      'Aaron Aardvark',
    );
    assert.ok(component.selectedInstructors.users[2].userStatus.accountIsDisabled);
    assert.notOk(component.noSelectedInstructors.isVisible);
    assert.strictEqual(component.availableInstructors.label, 'Available Instructors:');
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('it renders without selected instructors', async function (assert) {
    this.set('instructors', []);
    await render(
      <template>
        <InstructorManager @instructors={{this.instructors}} @add={{(noop)}} @remove={{(noop)}} />
      </template>,
    );
    assert.strictEqual(component.selectedInstructors.label, 'Selected Instructors:');
    assert.strictEqual(component.selectedInstructors.users.length, 0);
    assert.ok(component.noSelectedInstructors.isVisible);
    assert.strictEqual(component.noSelectedInstructors.text, 'None');
  });

  test('add instructor', async function (assert) {
    this.set('add', (user) => {
      assert.step('add called');
      assert.strictEqual(user, this.user1);
    });
    this.set('instructors', []);
    await render(
      <template>
        <InstructorManager @instructors={{this.instructors}} @add={{this.add}} @remove={{(noop)}} />
      </template>,
    );
    await component.availableInstructors.userSearch.searchBox.set('guy');
    assert.strictEqual(component.availableInstructors.userSearch.results.items.length, 3);
    assert.strictEqual(
      component.availableInstructors.userSearch.results.items[0].text,
      '0 guy M. Mc0son user@example.edu',
    );
    await component.availableInstructors.userSearch.results.items[0].click();
    assert.verifySteps(['add called']);
  });

  test('remove instructor', async function (assert) {
    this.set('remove', (user) => {
      assert.step('remove called');
      assert.strictEqual(user, this.user2);
    });
    const instructors = [this.user1, this.user2];
    this.set('instructors', instructors);
    await render(
      <template>
        <InstructorManager
          @instructors={{this.instructors}}
          @add={{(noop)}}
          @remove={{this.remove}}
        />
      </template>,
    );
    assert.strictEqual(component.selectedInstructors.users.length, 2);
    assert.strictEqual(
      component.selectedInstructors.users[0].userNameInfo.fullName,
      '0 guy M. Mc0son',
    );
    assert.strictEqual(
      component.selectedInstructors.users[1].userNameInfo.fullName,
      'Aaron Aardvark',
    );
    await component.selectedInstructors.users[1].remove();
    assert.verifySteps(['remove called']);
  });
});
