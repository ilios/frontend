import { module, test } from 'qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { component } from 'ilios-common/page-objects/components/dashboard/user-context-filter';

module('Integration | Component | dashboard/user-context-filter', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function (assert) {
    await render(hbs`<Dashboard::UserContextFilter />`);
    assert.strictEqual(component.instructingLabel.text, 'Instructing');
    assert.notOk(component.instructingInput.isChecked);
    assert.strictEqual(component.learningLabel.text, 'Learning');
    assert.notOk(component.learningInput.isChecked);
    assert.strictEqual(component.adminLabel.text, 'Admin');
    assert.notOk(component.adminInput.isChecked);
  });

  test('selecting learning filter', async function (assert) {
    assert.expect(2);
    this.set('setUserContext', (context) => {
      assert.strictEqual(context, 'learner');
    });
    await render(hbs`<Dashboard::UserContextFilter @setUserContext={{this.setUserContext}} />`);
    assert.notOk(component.learningInput.isChecked);
    await component.learningLabel.click();
  });

  test('de-selecting learning filter', async function (assert) {
    assert.expect(2);
    this.set('userContext', 'learner');
    this.set('setUserContext', (context) => {
      assert.strictEqual(context, null);
    });
    await render(
      hbs`<Dashboard::UserContextFilter @setUserContext={{this.setUserContext}} @userContext={{this.userContext}}/>`,
    );
    assert.ok(component.learningInput.isChecked);
    await component.learningLabel.click();
  });

  test('selecting instructing filter', async function (assert) {
    assert.expect(2);
    this.set('setUserContext', (context) => {
      assert.strictEqual(context, 'instructor');
    });
    await render(hbs`<Dashboard::UserContextFilter @setUserContext={{this.setUserContext}} />`);
    assert.notOk(component.instructingInput.isChecked);
    await component.instructingInput.click();
  });

  test('de-selecting instructing filter', async function (assert) {
    assert.expect(2);
    this.set('userContext', 'instructor');
    this.set('setUserContext', (context) => {
      assert.strictEqual(context, null);
    });
    await render(
      hbs`<Dashboard::UserContextFilter @setUserContext={{this.setUserContext}} @userContext={{this.userContext}}/>`,
    );
    assert.ok(component.instructingInput.isChecked);
    await component.instructingLabel.click();
  });

  test('selecting admin filter', async function (assert) {
    assert.expect(2);
    this.set('setUserContext', (context) => {
      assert.strictEqual(context, 'administrator');
    });
    await render(hbs`<Dashboard::UserContextFilter @setUserContext={{this.setUserContext}} />`);
    assert.notOk(component.adminInput.isChecked);
    await component.adminInput.click();
  });

  test('de-selecting admin filter', async function (assert) {
    assert.expect(2);
    this.set('userContext', 'administrator');
    this.set('setUserContext', (context) => {
      assert.strictEqual(context, null);
    });
    await render(
      hbs`<Dashboard::UserContextFilter @setUserContext={{this.setUserContext}} @userContext={{this.userContext}}/>`,
    );
    assert.ok(component.adminInput.isChecked);
    await component.adminLabel.click();
  });
});
