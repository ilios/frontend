import { module, test } from 'qunit';
import { setupRenderingTest } from 'dummy/tests/helpers';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { component } from 'ilios-common/page-objects/components/session-overview-ilm-duedate';
import { a11yAudit } from 'ember-a11y-testing/test-support';

module('Integration | Component | session-overview-ilm-duedate', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const ilmSession = this.server.create('ilm-session', {
      dueDate: new Date(2021, 4, 19, 23, 55, 0),
    });
    this.ilmSession = await this.owner
      .lookup('service:store')
      .findRecord('ilmSession', ilmSession.id);
  });

  test('it renders and is accessible', async function (assert) {
    this.set('editable', true);
    await render(hbs`<SessionOverviewIlmDuedate
      @ilmSession={{this.ilmSession}}
      @editable={{this.editable}}
    />`);

    assert.ok(component.isVisible);
    assert.strictEqual(component.label, 'Due By:');
    assert.strictEqual(component.value, '5/19/21, 11:55 PM');
    assert.ok(component.isEditable);
    await a11yAudit(this.element);
    assert.ok(true, 'not a11y violations');
  });

  test('it renders in read-only mode and is accessible', async function (assert) {
    this.set('editable', false);

    await render(hbs`<SessionOverviewIlmDuedate
      @ilmSession={{this.ilmSession}}
      @editable={{this.editable}}
    />`);

    assert.strictEqual(component.label, 'Due By:');
    assert.strictEqual(component.value, '5/19/21, 11:55 PM');
    assert.notOk(component.isEditable);
    await a11yAudit(this.element);
    assert.ok(true, 'not a11y violations');
  });

  test('change date and time, then save', async function (assert) {
    this.set('editable', true);

    await render(hbs`<SessionOverviewIlmDuedate
      @ilmSession={{this.ilmSession}}
      @editable={{this.editable}}
    />`);

    assert.strictEqual(component.value, '5/19/21, 11:55 PM');
    await component.edit();
    assert.strictEqual(component.datePicker.value, '5/19/2021');
    assert.strictEqual(component.timePicker.hour.value, '11');
    assert.strictEqual(component.timePicker.minute.value, '55');
    assert.strictEqual(component.timePicker.ampm.value, 'pm');
    await component.datePicker.set('1/1/1999');
    await component.timePicker.hour.select('5');
    await component.timePicker.minute.select('23');
    await component.timePicker.ampm.select('am');
    await component.save();
    assert.strictEqual(component.value, '1/1/99, 5:23 AM');
  });

  test('change date and time, then cancel', async function (assert) {
    this.set('editable', true);

    await render(hbs`<SessionOverviewIlmDuedate
      @ilmSession={{this.ilmSession}}
      @editable={{this.editable}}
    />`);

    assert.strictEqual(component.value, '5/19/21, 11:55 PM');
    await component.edit();
    assert.strictEqual(component.datePicker.value, '5/19/2021');
    assert.strictEqual(component.timePicker.hour.value, '11');
    assert.strictEqual(component.timePicker.minute.value, '55');
    assert.strictEqual(component.timePicker.ampm.value, 'pm');
    await component.datePicker.set('1/1/1999');
    await component.timePicker.hour.select('5');
    await component.timePicker.minute.select('23');
    await component.timePicker.ampm.select('am');
    await component.cancel();
    assert.strictEqual(component.value, '5/19/21, 11:55 PM');
  });
});
