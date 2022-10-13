import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { component } from 'ilios/tests/pages/components/curriculum-inventory/report-list-item';

module('Integration | Component | curriculum-inventory/report-list-item', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const school = this.server.create('school');
    this.program = this.server.create('program', { school });
    const report = this.server.create('curriculum-inventory-report', {
      program: this.program,
      name: 'CI Report',
      year: '2017',
      startDate: new Date('2017-07-01'),
      endDate: new Date('2018-06-30'),
    });
    this.report = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-report', report.id);
    this.permissionCheckerMock = class extends Service {
      async canDeleteCurriculumInventoryReport() {
        return true;
      }
    };
    this.owner.register('service:permission-checker', this.permissionCheckerMock);
  });

  test('it renders', async function (assert) {
    this.set('report', this.report);

    await render(
      hbs`<CurriculumInventory::ReportListItem @report={{this.report}} @remove={{(noop)}}/>`
    );

    assert.strictEqual(component.name, 'CI Report');
    assert.strictEqual(component.program, 'program 0');
    assert.strictEqual(component.year, '2017');
    assert.strictEqual(component.startDate, this.intl.formatDate(this.report.startDate));
    assert.strictEqual(component.endDate, this.intl.formatDate(this.report.endDate));
    assert.strictEqual(component.status, 'Draft');
    assert.ok(component.isDeletable);
    assert.notOk(component.confirmRemoval.isVisible);
  });

  test('delete', async function (assert) {
    assert.expect(3);
    this.set('report', this.report);
    this.set('remove', (r) => {
      assert.strictEqual(r, this.report);
    });
    await render(
      hbs`<CurriculumInventory::ReportListItem @report={{this.report}} @remove={{this.remove}}/>`
    );
    assert.notOk(component.confirmRemoval.isVisible);
    await component.remove();
    assert.ok(component.confirmRemoval.isVisible);
    await component.confirmRemoval.confirm();
  });

  test('cannot delete', async function (assert) {
    this.permissionCheckerMock.reopen({
      canDeleteCurriculumInventoryReport() {
        return false;
      },
    });
    this.set('report', this.report);

    await render(
      hbs`<CurriculumInventory::ReportListItem @report={{this.report}} @remove={{this.remove}}/>`
    );

    assert.notOk(component.isDeletable);
  });

  test('report with export shows as "finalized"', async function (assert) {
    const reportExport = this.server.create('curriculum-inventory-export');
    this.report.export = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-export', reportExport.id);
    this.set('report', this.report);

    await render(
      hbs`<CurriculumInventory::ReportListItem @report={{this.report}} @remove={{(noop)}}/>`
    );

    assert.strictEqual(component.status, 'Finalized');
  });

  test('academic year shows as range depending on application config', async function (assert) {
    this.server.get('application/config', function () {
      return {
        config: {
          academicYearCrossesCalendarYearBoundaries: true,
        },
      };
    });
    this.set('report', this.report);

    await render(
      hbs`<CurriculumInventory::ReportListItem @report={{this.report}} @remove={{(noop)}}/>`
    );

    assert.strictEqual(component.year, '2017 - 2018');
  });
});
