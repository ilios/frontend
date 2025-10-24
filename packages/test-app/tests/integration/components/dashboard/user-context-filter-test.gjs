import { module, test } from 'qunit';
import { render } from '@ember/test-helpers';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { setupMirage } from 'test-app/tests/test-support/mirage';
import { a11yAudit } from 'ember-a11y-testing/test-support';
import { component } from 'ilios-common/page-objects/components/dashboard/user-context-filter';
import UserContextFilter from 'ilios-common/components/dashboard/user-context-filter';

module('Integration | Component | dashboard/user-context-filter', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function (assert) {
    await render(<template><UserContextFilter /></template>);
    assert.strictEqual(component.instructing.label, 'Instructing');
    assert.strictEqual(component.instructing.ariaDescription, 'Show only my instructor activities');
    assert.strictEqual(component.instructing.title, 'Show only my instructor activities');
    assert.notOk(component.instructing.isChecked);
    assert.ok(component.instructing.isActive);
    assert.strictEqual(component.learning.label, 'Learning');
    assert.strictEqual(component.learning.ariaDescription, 'Show only my learner activities');
    assert.strictEqual(component.learning.title, 'Show only my learner activities');
    assert.notOk(component.learning.isChecked);
    assert.ok(component.learning.isActive);
    assert.strictEqual(component.admin.label, 'Admin');
    assert.strictEqual(component.admin.ariaDescription, 'Show only my admin activities');
    assert.strictEqual(component.admin.title, 'Show only my admin activities');
    assert.notOk(component.admin.isChecked);
    assert.ok(component.admin.isActive);
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('selecting learning filter', async function (assert) {
    this.set('setUserContext', (context) => {
      assert.step('setUserContext called');
      assert.strictEqual(context, 'learner');
    });
    await render(
      <template><UserContextFilter @setUserContext={{this.setUserContext}} /></template>,
    );
    assert.notOk(component.learning.isChecked);
    await component.learning.toggle();
    assert.verifySteps(['setUserContext called']);
  });

  test('de-selecting learning filter', async function (assert) {
    this.set('userContext', 'learner');
    this.set('setUserContext', (context) => {
      assert.step('setUserContext called');
      assert.strictEqual(context, null);
    });
    await render(
      <template>
        <UserContextFilter
          @setUserContext={{this.setUserContext}}
          @userContext={{this.userContext}}
        />
      </template>,
    );
    assert.strictEqual(component.learning.ariaDescription, 'Show all my activities');
    assert.strictEqual(component.learning.title, 'Show all my activities');
    assert.ok(component.learning.isChecked);
    assert.notOk(component.instructing.isActive);
    assert.ok(component.learning.isActive);
    assert.notOk(component.admin.isActive);
    await component.learning.toggle();
    assert.verifySteps(['setUserContext called']);
  });

  test('selecting instructing filter', async function (assert) {
    this.set('setUserContext', (context) => {
      assert.step('setUserContext called');
      assert.strictEqual(context, 'instructor');
    });
    await render(
      <template><UserContextFilter @setUserContext={{this.setUserContext}} /></template>,
    );
    assert.notOk(component.instructing.isChecked);
    await component.instructing.toggle();
    assert.verifySteps(['setUserContext called']);
  });

  test('de-selecting instructing filter', async function (assert) {
    this.set('userContext', 'instructor');
    this.set('setUserContext', (context) => {
      assert.step('setUserContext called');
      assert.strictEqual(context, null);
    });
    await render(
      <template>
        <UserContextFilter
          @setUserContext={{this.setUserContext}}
          @userContext={{this.userContext}}
        />
      </template>,
    );
    assert.strictEqual(component.instructing.ariaDescription, 'Show all my activities');
    assert.strictEqual(component.instructing.title, 'Show all my activities');
    assert.ok(component.instructing.isChecked);
    assert.ok(component.instructing.isActive);
    assert.notOk(component.learning.isActive);
    assert.notOk(component.admin.isActive);
    await component.instructing.toggle();
    assert.verifySteps(['setUserContext called']);
  });

  test('selecting admin filter', async function (assert) {
    this.set('setUserContext', (context) => {
      assert.step('setUserContext called');
      assert.strictEqual(context, 'administrator');
    });
    await render(
      <template><UserContextFilter @setUserContext={{this.setUserContext}} /></template>,
    );
    assert.notOk(component.admin.isChecked);
    await component.admin.toggle();
    assert.verifySteps(['setUserContext called']);
  });

  test('de-selecting admin filter', async function (assert) {
    this.set('userContext', 'administrator');
    this.set('setUserContext', (context) => {
      assert.step('setUserContext called');
      assert.strictEqual(context, null);
    });
    await render(
      <template>
        <UserContextFilter
          @setUserContext={{this.setUserContext}}
          @userContext={{this.userContext}}
        />
      </template>,
    );
    assert.strictEqual(component.admin.ariaDescription, 'Show all my activities');
    assert.strictEqual(component.admin.title, 'Show all my activities');
    assert.ok(component.admin.isChecked);
    assert.notOk(component.instructing.isActive);
    assert.notOk(component.learning.isActive);
    assert.ok(component.admin.isActive);
    await component.admin.toggle();
    assert.verifySteps(['setUserContext called']);
  });
});
