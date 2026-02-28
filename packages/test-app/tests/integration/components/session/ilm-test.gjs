import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { component } from 'ilios-common/page-objects/components/session/ilm';
import { a11yAudit } from 'ember-a11y-testing/test-support';
import { setupMirage } from 'test-app/tests/test-support/mirage';
import Ilm from 'ilios-common/components/session/ilm';

module('Integration | Component | session/ilm', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders and is accessible when not editable with ILM', async function (assert) {
    const ilmSession = this.server.create('ilmSession', { hours: 8 });
    this.set('session', this.server.create('session', { ilmSession }));
    await render(<template><Ilm @session={{this.session}} @editable={{false}} /></template>);
    assert.ok(component.ilmHours.isVisible);
    assert.strictEqual(component.ilmHours.value, '8');
    assert.notOk(component.ilmHours.edit.isVisible);
    assert.ok(component.ilmDueDateAndTime.isVisible);
    assert.notOk(component.ilmDueDateAndTime.isEditable);
    assert.notOk(component.canAdd);
    assert.notOk(component.canRemove);
    assert.ok(component.isIlm);

    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('it does not render when not editable with no ILM', async function (assert) {
    this.set('session', this.server.create('session'));
    await render(<template><Ilm @session={{this.session}} @editable={{false}} /></template>);
    assert.notOk(component.isVisible);

    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('it renders and is accessible when editable with ILM', async function (assert) {
    const ilmSession = this.server.create('ilmSession');
    this.set('session', this.server.create('session', { ilmSession }));
    await render(<template><Ilm @session={{this.session}} @editable={{true}} /></template>);
    assert.ok(component.ilmHours.isVisible);
    assert.ok(component.ilmDueDateAndTime.isVisible);
    assert.notOk(component.canAdd);
    assert.ok(component.canRemove);

    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('it renders and is accessible when editable with no ILM', async function (assert) {
    this.set('session', this.server.create('session'));
    await render(<template><Ilm @session={{this.session}} @editable={{true}} /></template>);
    assert.notOk(component.ilmHours.isVisible);
    assert.notOk(component.ilmDueDateAndTime.isVisible);
    assert.ok(component.canAdd);
    assert.notOk(component.canRemove);

    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('shows error with hours less than zero', async function (assert) {
    const ilmSession = this.server.create('ilmSession');
    this.set('session', this.server.create('session', { ilmSession }));
    await render(<template><Ilm @session={{this.session}} @editable={{true}} /></template>);
    await component.ilmHours.edit();
    await component.ilmHours.set('-1');
    await component.ilmHours.save();
    assert.ok(component.ilmHours.hasError);
  });

  test('error clears with close and re-open', async function (assert) {
    const ilmSession = this.server.create('ilmSession');
    this.set('session', this.server.create('session', { ilmSession }));
    await render(<template><Ilm @session={{this.session}} @editable={{true}} /></template>);
    await component.ilmHours.edit();
    await component.ilmHours.set('-1');
    await component.ilmHours.save();
    await component.ilmHours.cancel();
    await component.ilmHours.edit();
    assert.notOk(component.ilmHours.hasError);
  });

  test('remove and confirm', async function (assert) {
    const ilmSession = this.server.create('ilmSession');
    const session = this.server.create('session', { ilmSession });
    this.set('session', await this.owner.lookup('service:store').findRecord('session', session.id));
    await render(<template><Ilm @session={{this.session}} @editable={{true}} /></template>);
    assert.ok(component.isIlm);
    assert.ok(component.canRemove);
    await component.removeIlm();
    assert.ok(component.confirmationMessage.isVisible);

    await a11yAudit(this.element);
    await component.confirm();

    assert.notOk(component.isIlm);
    assert.ok(component.canAdd);
    assert.strictEqual(this.server.db.ilmSessions.length, 0);
  });

  test('remove and cancel', async function (assert) {
    const ilmSession = this.server.create('ilmSession');
    const session = this.server.create('session', { ilmSession });
    this.set('session', await this.owner.lookup('service:store').findRecord('session', session.id));
    await render(<template><Ilm @session={{this.session}} @editable={{true}} /></template>);
    assert.ok(component.isIlm);
    assert.ok(component.canRemove);
    await component.removeIlm();
    assert.ok(component.confirmationMessage.isVisible);
    await component.cancel();

    assert.ok(component.isIlm);
    assert.notOk(component.canAdd);
    assert.ok(component.canRemove);
    assert.strictEqual(this.server.db.ilmSessions.length, 1);
  });

  test('remove and undo', async function (assert) {
    const ilmSession = this.server.create('ilmSession');
    const session = this.server.create('session', { ilmSession });
    this.set('session', await this.owner.lookup('service:store').findRecord('session', session.id));
    await render(<template><Ilm @session={{this.session}} @editable={{true}} /></template>);
    assert.ok(component.isIlm);
    assert.ok(component.canRemove);
    await component.removeIlm();
    assert.ok(component.confirmationMessage.isVisible);
    await component.undo();

    assert.ok(component.isIlm);
    assert.notOk(component.canAdd);
    assert.ok(component.canRemove);
    assert.strictEqual(this.server.db.ilmSessions.length, 1);
  });
});
