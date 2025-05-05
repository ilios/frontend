import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { DateTime } from 'luxon';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import { component } from 'frontend/tests/pages/components/curriculum-inventory/report-list';
import ReportList from 'frontend/components/curriculum-inventory/report-list';
import noop from 'ilios-common/helpers/noop';
import { array } from '@ember/helper';

module('Integration | Component | curriculum-inventory/report-list', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    this.intl = this.owner.lookup('service:intl');
    const school = this.server.create('school');
    this.program = this.server.create('program', { school });
    this.permissionCheckerMock = class extends Service {
      async canDeleteCurriculumInventoryReport() {
        return true;
      }
    };
    this.owner.register('service:permission-checker', this.permissionCheckerMock);
  });

  test('it renders', async function (assert) {
    const report1 = this.server.create('curriculum-inventory-report', {
      program: this.program,
      name: 'Zeppelin',
      year: 2017,
      startDate: DateTime.fromObject({ year: 2017, month: 7, day: 1 }).toJSDate(),
      endDate: DateTime.fromObject({ year: 2018, month: 6, day: 30 }).toJSDate(),
    });
    const reportExport = this.server.create('curriculum-inventory-export');
    const report2 = this.server.create('curriculum-inventory-report', {
      program: this.program,
      export: reportExport,
      name: 'Aardvark',
      year: 2016,
      startDate: DateTime.fromObject({ year: 2016, month: 7, day: 1 }).toJSDate(),
      endDate: DateTime.fromObject({ year: 2017, month: 6, day: 30 }).toJSDate(),
    });

    const reportModel1 = await this.owner
      .lookup('service:store')
      .findRecord('curriculum-inventory-report', report1.id);
    const reportModel2 = await this.owner
      .lookup('service:store')
      .findRecord('curriculum-inventory-report', report2.id);
    const programModel = await this.owner
      .lookup('service:store')
      .findRecord('program', this.program.id);
    const reports = [reportModel1, reportModel2];

    this.set('reports', reports);
    await render(<template><ReportList @reports={{this.reports}} @remove={{(noop)}} /></template>);
    assert.strictEqual(
      component.headers.name,
      'Report Name',
      'First column table header is labeled correctly',
    );
    assert.strictEqual(
      component.headers.program,
      'Program',
      'Second column table header is labeled correctly',
    );
    assert.strictEqual(
      component.headers.year,
      'Academic Year',
      'Third column table header is labeled correctly',
    );
    assert.strictEqual(
      component.headers.startDate,
      'Start Date',
      'Fourth column table header is labeled correctly',
    );
    assert.strictEqual(
      component.headers.endDate,
      'End Date',
      'Fifth column table header is labeled correctly',
    );
    assert.strictEqual(
      component.headers.status,
      'Status',
      'Sixth column table header is labeled correctly',
    );
    assert.strictEqual(
      component.headers.actions,
      'Actions',
      'Seventh column table header is labeled correctly',
    );
    assert.strictEqual(component.reports.length, reports.length, 'All reports are shown in list.');
    assert.strictEqual(component.reports[0].name, reportModel2.name, 'Report name shows.');
    assert.strictEqual(component.reports[0].program, programModel.title, 'Program title shows.');
    assert.strictEqual(component.reports[0].year, '2016', 'Academic year shows.');
    assert.strictEqual(
      component.reports[0].startDate,
      this.intl.formatDate(reportModel2.startDate, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }),
      'Start date shows.',
    );
    assert.strictEqual(
      component.reports[0].endDate,
      this.intl.formatDate(reportModel2.endDate, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }),
      'End date shows.',
    );
    assert.strictEqual(component.reports[0].status, 'Finalized', 'Status shows.');
    assert.strictEqual(component.reports[1].name, reportModel1.name, 'Report name shows.');
    assert.strictEqual(component.reports[1].program, programModel.title, 'Program title shows.');
    assert.strictEqual(component.reports[1].year, '2017', 'Academic year shows.');
    assert.strictEqual(
      component.reports[1].startDate,
      this.intl.formatDate(reportModel1.startDate, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }),
      'Start date shows.',
    );
    assert.strictEqual(
      component.reports[1].endDate,
      this.intl.formatDate(reportModel1.endDate, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }),
      'End date shows.',
    );
    assert.strictEqual(component.reports[1].status, 'Draft', 'Status shows.');
  });

  test('report can be deleted', async function (assert) {
    const report = this.server.create('curriculum-inventory-report', {
      program: this.program,
      name: 'Zeppelin',
      year: 2017,
      startDate: DateTime.fromObject({ year: 2017, month: 7, day: 1 }).toJSDate(),
      endDate: DateTime.fromObject({ year: 2018, month: 6, day: 30 }).toJSDate(),
    });
    const reportModel = await this.owner
      .lookup('service:store')
      .findRecord('curriculum-inventory-report', report.id);
    this.set('reports', [reportModel]);

    await render(<template><ReportList @reports={{this.reports}} @remove={{(noop)}} /></template>);

    assert.ok(component.reports[0].isDeletable);
  });

  test('report cannot be deleted', async function (assert) {
    this.permissionCheckerMock.reopen({
      async canDeleteCurriculumInventoryReport() {
        return false;
      },
    });
    const reportExport = this.server.create('curriculum-inventory-export');
    const report = this.server.create('curriculum-inventory-report', {
      program: this.program,
      name: 'Zeppelin',
      year: 2017,
      export: reportExport,
      startDate: DateTime.fromObject({ year: 2017, month: 7, day: 1 }).toJSDate(),
      endDate: DateTime.fromObject({ year: 2018, month: 6, day: 30 }).toJSDate(),
    });
    const reportModel = await this.owner
      .lookup('service:store')
      .findRecord('curriculum-inventory-report', report.id);
    this.set('reports', [reportModel]);

    await render(<template><ReportList @reports={{this.reports}} @remove={{(noop)}} /></template>);

    assert.notOk(component.reports[0].isDeletable);
  });

  test('empty list', async function (assert) {
    await render(<template><ReportList @reports={{(array)}} @remove={{(noop)}} /></template>);
    assert.strictEqual(component.emptyList.text, 'None');
  });

  test('delete and confirm', async function (assert) {
    assert.expect(3);
    const report = this.server.create('curriculum-inventory-report', {
      program: this.program,
      name: 'Zeppelin',
    });
    const reportModel = await this.owner
      .lookup('service:store')
      .findRecord('curriculum-inventory-report', report.id);
    this.set('reports', [reportModel]);
    this.set('removeAction', (obj) => {
      assert.strictEqual(report.id, obj.id, 'Report is passed to remove action.');
    });
    await render(
      <template><ReportList @reports={{this.reports}} @remove={{this.removeAction}} /></template>,
    );
    assert.notOk(component.confirmRemoval.isVisible, 'Confirm dialog is initially not visible.');
    await component.reports[0].remove();
    assert.ok(component.confirmRemoval.isVisible, 'Confirm dialog shows.');
    await component.confirmRemoval.confirm();
  });

  test('delete and cancel', async function (assert) {
    assert.expect(3);
    const report = this.server.create('curriculum-inventory-report', {
      program: this.program,
      name: 'Zeppelin',
    });
    const reportModel = await this.owner
      .lookup('service:store')
      .findRecord('curriculum-inventory-report', report.id);

    this.set('reports', [reportModel]);
    this.set('removeAction', () => {
      assert.ok(false, 'Remove action should not have been invoked.');
    });
    await render(
      <template><ReportList @reports={{this.reports}} @remove={{this.removeAction}} /></template>,
    );
    assert.notOk(component.confirmRemoval.isVisible, 'Confirm dialog is initially not visible.');
    await component.reports[0].remove();
    assert.ok(component.confirmRemoval.isVisible, 'Confirm dialog shows.');
    await component.confirmRemoval.cancel();
    assert.notOk(component.confirmRemoval.isVisible, 'Confirm dialog is invisible again.');
  });

  test('sorting', async function (assert) {
    assert.expect(4);
    const report = this.server.create('curriculum-inventory-report', {
      program: this.program,
      name: 'Zeppelin',
    });
    const reportModel = await this.owner
      .lookup('service:store')
      .findRecord('curriculum-inventory-report', report.id);

    let count = 0;
    const sortBys = ['name', 'name:desc', 'year', 'year:desc'];

    this.set('reports', [reportModel]);
    this.set('sortBy', 'id');
    this.set('setSortBy', (what) => {
      assert.strictEqual(what, sortBys[count]);
      this.set('sortBy', what);
      count++;
    });
    await render(
      <template>
        <ReportList
          @reports={{this.reports}}
          @setSortBy={{this.setSortBy}}
          @sortBy={{this.sortBy}}
          @remove={{(noop)}}
        />
      </template>,
    );
    await component.headers.clickOnName();
    await component.headers.clickOnName();
    await component.headers.clickOnYear();
    await component.headers.clickOnYear();
  });

  test('academic year shows range depending on application config', async function (assert) {
    const report1 = this.server.create('curriculum-inventory-report', {
      program: this.program,
      name: 'Zeppelin',
      year: 2017,
      startDate: DateTime.fromObject({ year: 2017, month: 7, day: 1 }).toJSDate(),
      endDate: DateTime.fromObject({ year: 2018, month: 6, day: 30 }).toJSDate(),
    });

    const reportModel1 = await this.owner
      .lookup('service:store')
      .findRecord('curriculum-inventory-report', report1.id);
    const reports = [reportModel1];
    this.server.get('application/config', function () {
      return {
        config: {
          academicYearCrossesCalendarYearBoundaries: true,
        },
      };
    });
    this.set('reports', reports);
    await render(<template><ReportList @reports={{this.reports}} @remove={{(noop)}} /></template>);
    assert.strictEqual(component.reports[0].year, '2017 - 2018', 'Academic year shows range.');
  });
});
