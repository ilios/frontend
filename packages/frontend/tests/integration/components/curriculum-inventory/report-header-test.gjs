import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import { component } from 'frontend/tests/pages/components/curriculum-inventory/report-header';
import ReportHeader from 'frontend/components/curriculum-inventory/report-header';
import noop from 'ilios-common/helpers/noop';

module('Integration | Component | curriculum-inventory/report-header', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const report = this.server.create('CurriculumInventoryReport', {
      absoluteFileUri: 'https://iliosinstance.com/foo/bar',
      name: 'Report name',
    });
    this.report = await this.owner
      .lookup('service:store')
      .findRecord('curriculum-inventory-report', report.id);
  });

  test('it renders', async function (assert) {
    await render(
      <template>
        <ReportHeader @report={{this.report}} @canUpdate={{true}} @finalize={{(noop)}} />
      </template>,
    );
    assert.strictEqual(this.report.name, component.name.value, 'Report name shows.');
    assert.ok(component.name.isEditable, 'Report name is editable.');
    assert.notOk(component.finalizeButtonIsDisabled, 'Finalize button is not disabled.');
    assert.ok(component.canBeDownloaded, 'Download link shows.');
    assert.strictEqual(
      this.report.absoluteFileUri,
      component.downloadLink.link,
      'Download link target is correct',
    );
  });

  test('non updatable reports render in read-only mode.', async function (assert) {
    await render(
      <template>
        <ReportHeader @report={{this.report}} @canUpdate={{false}} @finalize={{(noop)}} />
      </template>,
    );
    assert.strictEqual(this.report.name, component.lockedName);
    assert.ok(component.hasLockOnName, 'Lock icon is showing with name.');
    assert.notOk(component.name.isEditable, 'Report name is not editable.');
    assert.ok(component.canBeDownloaded, 'Download link shows.');
    assert.ok(component.finalizeButtonIsDisabled, 'Finalize button is not disabled.');
  });

  test('change name', async function (assert) {
    const newName = 'new name';
    await render(
      <template>
        <ReportHeader @report={{this.report}} @canUpdate={{true}} @finalize={{(noop)}} />
      </template>,
    );
    await component.name.edit();
    assert.notOk(component.name.hasError);
    await component.name.set(newName);
    await component.name.save();
    assert.notOk(component.name.hasError);
    assert.strictEqual(newName, component.name.value);
  });

  test('change name fails on empty value', async function (assert) {
    this.set('report', this.report);
    await render(
      <template>
        <ReportHeader @report={{this.report}} @canUpdate={{true}} @finalize={{(noop)}} />
      </template>,
    );
    await component.name.edit();
    assert.notOk(component.name.hasError);
    await component.name.set('');
    await component.name.save();
    assert.ok(component.name.hasError);
    await component.name.cancel();
    assert.notOk(component.name.hasError);
  });

  test('change name fails if name is too long', async function (assert) {
    this.set('report', this.report);
    await render(
      <template>
        <ReportHeader @report={{this.report}} @canUpdate={{true}} @finalize={{(noop)}} />
      </template>,
    );
    await component.name.edit();
    assert.notOk(component.name.hasError);
    await component.name.set('01234567890'.repeat(21));
    await component.name.save();
    assert.ok(component.name.hasError);
  });

  test('clicking on finalize button fires action', async function (assert) {
    assert.expect(1);
    this.set('finalize', () => {
      assert.ok(true, 'Finalize action was invoked.');
    });
    await render(
      <template>
        <ReportHeader @report={{this.report}} @canUpdate={{true}} @finalize={{this.finalize}} />
      </template>,
    );
    await component.finalize();
  });

  test('#i6159 validation status', async function (assert) {
    this.set('report', this.report);
    await render(
      <template>
        <ReportHeader @report={{this.report}} @canUpdate={{true}} @finalize={{(noop)}} />
      </template>,
    );
    assert.ok(component.name.isVisible);
    assert.strictEqual(component.name.value, 'Report name');
    await component.name.edit();
    await component.name.set('');
    await component.name.save();
    assert.ok(component.name.hasError);
    await component.name.cancel();
    assert.strictEqual(component.name.value, 'Report name');
    await component.name.edit();
    assert.notOk(component.name.hasError);
    assert.strictEqual(component.name.inputValue, 'Report name');
    await component.name.blur();
    assert.notOk(component.name.hasError);
  });
});
