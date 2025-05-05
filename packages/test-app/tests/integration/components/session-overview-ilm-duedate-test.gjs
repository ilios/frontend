import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { setupMirage } from 'test-app/tests/test-support/mirage';
import { component } from 'ilios-common/page-objects/components/session-overview-ilm-duedate';
import { a11yAudit } from 'ember-a11y-testing/test-support';
import SessionOverviewIlmDuedate from 'ilios-common/components/session-overview-ilm-duedate';

module('Integration | Component | session-overview-ilm-duedate', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const ilmSession = this.server.create('ilm-session', {
      dueDate: new Date(2021, 4, 19, 23, 55, 0),
    });
    this.ilmSession = await this.owner
      .lookup('service:store')
      .findRecord('ilm-session', ilmSession.id);
  });

  test('it renders and is accessible', async function (assert) {
    this.set('editable', true);
    await render(
      <template>
        <SessionOverviewIlmDuedate @ilmSession={{this.ilmSession}} @editable={{this.editable}} />
      </template>,
    );

    assert.ok(component.isVisible);
    assert.strictEqual(component.label, 'Due By:');
    assert.strictEqual(component.value, '05/19/21, 11:55 PM');
    assert.ok(component.isEditable);
    await a11yAudit(this.element);
    assert.ok(true, 'not a11y violations');
  });

  test('it renders in read-only mode and is accessible', async function (assert) {
    this.set('editable', false);

    await render(
      <template>
        <SessionOverviewIlmDuedate @ilmSession={{this.ilmSession}} @editable={{this.editable}} />
      </template>,
    );

    assert.strictEqual(component.label, 'Due By:');
    assert.strictEqual(component.value, '05/19/21, 11:55 PM');
    assert.notOk(component.isEditable);
    await a11yAudit(this.element);
    assert.ok(true, 'not a11y violations');
  });

  test('change date and time, then save', async function (assert) {
    this.set('editable', true);

    await render(
      <template>
        <SessionOverviewIlmDuedate @ilmSession={{this.ilmSession}} @editable={{this.editable}} />
      </template>,
    );

    assert.strictEqual(component.value, '05/19/21, 11:55 PM');
    await component.edit();
    assert.strictEqual(component.datePicker.value, '5/19/2021');
    assert.strictEqual(component.timePicker.hour.value, '11');
    assert.strictEqual(component.timePicker.minute.value, '55');
    assert.strictEqual(component.timePicker.ampm.value, 'PM');
    await component.datePicker.set('01/01/1999');
    await component.timePicker.hour.select('05');
    await component.timePicker.minute.select('23');
    await component.timePicker.ampm.select('AM');
    await component.save();
    assert.strictEqual(component.value, '01/01/99, 05:23 AM');
  });

  test('change date and time, then cancel', async function (assert) {
    this.set('editable', true);

    await render(
      <template>
        <SessionOverviewIlmDuedate @ilmSession={{this.ilmSession}} @editable={{this.editable}} />
      </template>,
    );

    assert.strictEqual(component.value, '05/19/21, 11:55 PM');
    await component.edit();
    assert.strictEqual(component.datePicker.value, '5/19/2021');
    assert.strictEqual(component.timePicker.hour.value, '11');
    assert.strictEqual(component.timePicker.minute.value, '55');
    assert.strictEqual(component.timePicker.ampm.value, 'PM');
    await component.datePicker.set('01/01/1999');
    await component.timePicker.hour.select('05');
    await component.timePicker.minute.select('23');
    await component.timePicker.ampm.select('AM');
    await component.cancel();
    assert.strictEqual(component.value, '05/19/21, 11:55 PM');
  });
});
