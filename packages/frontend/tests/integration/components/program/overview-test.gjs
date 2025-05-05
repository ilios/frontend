import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { component } from 'frontend/tests/pages/components/program/overview';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import Overview from 'frontend/components/program/overview';

module('Integration | Component | program/overview', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const school = this.server.create('school', {});
    this.program = this.server.create('program', {
      school,
    });
    this.programModel = await this.owner
      .lookup('service:store')
      .findRecord('program', this.program.id);
  });

  test('it renders edit only', async function (assert) {
    this.set('program', this.programModel);
    await render(<template><Overview @program={{this.program}} @canUpdate={{false}} /></template>);

    assert.notOk(component.shortTitle.editable);
    assert.strictEqual(component.shortTitle.value, 'short_0');

    assert.notOk(component.duration.editable);
    assert.strictEqual(component.duration.value, '4');
  });

  test('it renders editable', async function (assert) {
    this.set('program', this.programModel);
    await render(<template><Overview @program={{this.program}} @canUpdate={{true}} /></template>);

    assert.ok(component.shortTitle.editable);
    assert.strictEqual(component.shortTitle.value, 'short_0');

    assert.ok(component.duration.editable);
    assert.strictEqual(component.duration.value, '4');
  });

  test('change short title', async function (assert) {
    this.set('program', this.programModel);
    await render(<template><Overview @program={{this.program}} @canUpdate={{true}} /></template>);

    await component.shortTitle.edit();
    await component.shortTitle.set('new title');
    await component.shortTitle.save();
    assert.strictEqual(component.shortTitle.value, 'new title');
    assert.strictEqual(this.program.shortTitle, 'new title');
  });

  test('change duration', async function (assert) {
    this.set('program', this.programModel);
    await render(<template><Overview @program={{this.program}} @canUpdate={{true}} /></template>);

    await component.duration.edit();
    await component.duration.set('5');
    await component.duration.save();
    assert.strictEqual(component.duration.value, '5');
    assert.strictEqual(this.program.duration, 5);
  });

  test('short title too short', async function (assert) {
    this.set('program', this.programModel);
    await render(<template><Overview @program={{this.program}} @canUpdate={{true}} /></template>);

    await component.shortTitle.edit();
    await component.shortTitle.set('a');
    await component.shortTitle.save();
    assert.strictEqual(component.shortTitle.errors.length, 1);
    assert.strictEqual(
      component.shortTitle.errors[0].text,
      'This field is too short (minimum is 2 characters)',
    );
  });

  test('short title too long', async function (assert) {
    this.set('program', this.programModel);
    await render(<template><Overview @program={{this.program}} @canUpdate={{true}} /></template>);

    await component.shortTitle.edit();
    await component.shortTitle.set('a'.repeat(11));
    await component.shortTitle.save();
    assert.strictEqual(component.shortTitle.errors.length, 1);
    assert.strictEqual(
      component.shortTitle.errors[0].text,
      'This field is too long (maximum is 10 characters)',
    );
  });
});
