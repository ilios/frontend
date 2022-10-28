import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { component } from 'ilios/tests/pages/components/instructor-group/instructor-manager';

module('Integration | Component | instructor-group/instructor-manager', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const user1 = this.server.create('user');
    const user2 = this.server.create('user', { displayName: 'Aaron Aardvark' });
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
      hbs`<InstructorGroup::InstructorManager @instructors={{this.instructors}} @add={{(noop)}} @remove={{(noop)}} />`
    );
    assert.strictEqual(component.selectedInstructors.label, 'Selected Instructors:');
    assert.strictEqual(component.selectedInstructors.users.length, 3);
    assert.strictEqual(
      component.selectedInstructors.users[0].userNameInfo.fullName,
      '0 guy M. Mc0son'
    );
    assert.strictEqual(
      component.selectedInstructors.users[1].userNameInfo.fullName,
      '2 guy M. Mc2son'
    );
    assert.strictEqual(
      component.selectedInstructors.users[2].userNameInfo.fullName,
      'Aaron Aardvark'
    );
    assert.notOk(component.noSelectedInstructors.isVisible);
    assert.strictEqual(component.availableInstructors.label, 'Available Instructors:');
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('it renders without selected instructors', async function (assert) {
    this.set('instructors', []);
    await render(
      hbs`<InstructorGroup::InstructorManager @instructors={{this.instructors}} @add={{(noop)}} @remove={{(noop)}} />`
    );
    assert.strictEqual(component.selectedInstructors.label, 'Selected Instructors:');
    assert.strictEqual(component.selectedInstructors.users.length, 0);
    assert.ok(component.noSelectedInstructors.isVisible);
    assert.strictEqual(component.noSelectedInstructors.text, 'None');
  });

  test('add instructor', async function (assert) {
    assert.expect(3);
    this.set('add', (user) => {
      assert.strictEqual(user, this.user1);
    });
    this.set('instructors', []);
    await render(
      hbs`<InstructorGroup::InstructorManager @instructors={{this.instructors}} @add={{this.add}} @remove={{(noop)}} />`
    );
    await component.availableInstructors.userSearch.searchBox.set('guy');
    assert.strictEqual(component.availableInstructors.userSearch.results.items.length, 3);
    assert.strictEqual(
      component.availableInstructors.userSearch.results.items[0].text,
      '0 guy M. Mc0son user@example.edu'
    );
    await component.availableInstructors.userSearch.results.items[0].click();
  });

  test('remove instructor', async function (assert) {
    assert.expect(4);
    this.set('remove', (user) => {
      assert.strictEqual(user, this.user2);
    });
    const instructors = [this.user1, this.user2];
    this.set('instructors', instructors);
    await render(
      hbs`<InstructorGroup::InstructorManager @instructors={{this.instructors}} @add={{(noop)}} @remove={{this.remove}} />`
    );
    assert.strictEqual(component.selectedInstructors.users.length, 2);
    assert.strictEqual(
      component.selectedInstructors.users[0].userNameInfo.fullName,
      '0 guy M. Mc0son'
    );
    assert.strictEqual(
      component.selectedInstructors.users[1].userNameInfo.fullName,
      'Aaron Aardvark'
    );
    await component.selectedInstructors.users[1].remove();
  });
});
