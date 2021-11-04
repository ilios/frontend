import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import moment from 'moment';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { component } from 'ilios/tests/pages/components/curriculum-inventory/report-list';

module('Integration | Component | curriculum-inventory/report-list', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
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
      startDate: moment('2017-07-01').toDate(),
      endDate: moment('2018-06-30').toDate(),
    });
    const reportExport = this.server.create('curriculum-inventory-export');
    const report2 = this.server.create('curriculum-inventory-report', {
      program: this.program,
      export: reportExport,
      name: 'Aardvark',
      year: 2016,
      startDate: moment('2016-07-01').toDate(),
      endDate: moment('2017-06-30').toDate(),
    });

    const reportModel1 = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-report', report1.id);
    const reportModel2 = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-report', report2.id);
    const programModel = await this.owner.lookup('service:store').find('program', this.program.id);
    const reports = [reportModel1, reportModel2];

    this.set('reports', reports);
    await render(
      hbs`<CurriculumInventory::ReportList @reports={{this.reports}} @edit={{(noop)}} @remove={{(noop)}} />`
    );
    assert.strictEqual(
      component.headers.name,
      'Report Name',
      'First column table header is labeled correctly'
    );
    assert.strictEqual(
      component.headers.program,
      'Program',
      'Second column table header is labeled correctly'
    );
    assert.strictEqual(
      component.headers.year,
      'Academic Year',
      'Third column table header is labeled correctly'
    );
    assert.strictEqual(
      component.headers.startDate,
      'Start Date',
      'Fourth column table header is labeled correctly'
    );
    assert.strictEqual(
      component.headers.endDate,
      'End Date',
      'Fifth column table header is labeled correctly'
    );
    assert.strictEqual(
      component.headers.status,
      'Status',
      'Sixth column table header is labeled correctly'
    );
    assert.strictEqual(
      component.headers.actions,
      'Actions',
      'Seventh column table header is labeled correctly'
    );
    assert.strictEqual(component.reports.length, reports.length, 'All reports are shown in list.');
    assert.strictEqual(component.reports[0].name, reportModel2.name, 'Report name shows.');
    assert.strictEqual(component.reports[0].program, programModel.title, 'Program title shows.');
    assert.strictEqual(component.reports[0].year, '2016', 'Academic year shows.');
    assert.strictEqual(
      component.reports[0].startDate,
      moment(reportModel2.startDate).format('L'),
      'Start date shows.'
    );
    assert.strictEqual(
      component.reports[0].endDate,
      moment(reportModel2.endDate).format('L'),
      'End date shows.'
    );
    assert.strictEqual(component.reports[0].status, 'Finalized', 'Status shows.');
    assert.strictEqual(component.reports[1].name, reportModel1.name, 'Report name shows.');
    assert.strictEqual(component.reports[1].program, programModel.title, 'Program title shows.');
    assert.strictEqual(component.reports[1].year, '2017', 'Academic year shows.');
    assert.strictEqual(
      component.reports[1].startDate,
      moment(reportModel1.startDate).format('L'),
      'Start date shows.'
    );
    assert.strictEqual(
      component.reports[1].endDate,
      moment(reportModel1.endDate).format('L'),
      'End date shows.'
    );
    assert.strictEqual(component.reports[1].status, 'Draft', 'Status shows.');
  });

  test('report can be deleted', async function (assert) {
    const report = this.server.create('curriculum-inventory-report', {
      program: this.program,
      name: 'Zeppelin',
      year: 2017,
      startDate: moment('2017-07-01').toDate(),
      endDate: moment('2018-06-30').toDate(),
    });
    const reportModel = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-report', report.id);
    this.set('reports', [reportModel]);

    await render(
      hbs`<CurriculumInventory::ReportList @reports={{this.reports}} @edit={{(noop)}} @remove={{(noop)}} />`
    );

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
      startDate: moment('2017-07-01').toDate(),
      endDate: moment('2018-06-30').toDate(),
    });
    const reportModel = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-report', report.id);
    this.set('reports', [reportModel]);

    await render(
      hbs`<CurriculumInventory::ReportList @reports={{this.reports}} @edit={{(noop)}} @remove={{(noop)}} />`
    );

    assert.notOk(component.reports[0].isDeletable);
  });

  test('empty list', async function (assert) {
    await render(
      hbs`<CurriculumInventory::ReportList @reports={{(array)}} @edit={{(noop)}} @remove={{(noop)}}/>`
    );
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
      .find('curriculum-inventory-report', report.id);
    this.set('reports', [reportModel]);
    this.set('removeAction', (obj) => {
      assert.strictEqual(report.id, obj.id, 'Report is passed to remove action.');
    });
    await render(
      hbs`<CurriculumInventory::ReportList @reports={{this.reports}} @edit={{(noop)}} @remove={{this.removeAction}} />`
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
      .find('curriculum-inventory-report', report.id);

    this.set('reports', [reportModel]);
    this.set('removeAction', () => {
      assert.ok(false, 'Remove action should not have been invoked.');
    });
    await render(
      hbs`<CurriculumInventory::ReportList @reports={{this.reports}} @edit={{(noop)}} @remove={{this.removeAction}} />`
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
      .find('curriculum-inventory-report', report.id);

    let count = 0;
    const sortBys = ['name', 'name:desc', 'year', 'year:desc'];

    this.set('reports', [reportModel]);
    this.set('sortBy', 'id');
    this.set('setSortBy', (what) => {
      assert.strictEqual(what, sortBys[count]);
      this.set('sortBy', what);
      count++;
    });
    await render(hbs`<CurriculumInventory::ReportList
      @reports={{this.reports}}
      @setSortBy={{this.setSortBy}}
      @sortBy={{this.sortBy}}
      @edit={{(noop)}}
      @remove={{(noop)}}
    />`);
    await component.headers.clickOnName();
    await component.headers.clickOnName();
    await component.headers.clickOnYear();
    await component.headers.clickOnYear();
  });

  test('edit', async function (assert) {
    assert.expect(1);
    const report = this.server.create('curriculum-inventory-report', {
      program: this.program,
      name: 'Zeppelin',
    });
    const reportModel = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-report', report.id);

    this.set('reports', [reportModel]);
    this.set('editAction', (obj) => {
      assert.strictEqual(report.id, obj.id, 'Report is passed to edit action.');
    });
    await render(
      hbs`<CurriculumInventory::ReportList @reports={{this.reports}} @edit={{this.editAction}} @remove={{(noop)}} />`
    );
    await component.reports[0].edit();
  });

  test('academic year shows range depending on application config', async function (assert) {
    const report1 = this.server.create('curriculum-inventory-report', {
      program: this.program,
      name: 'Zeppelin',
      year: 2017,
      startDate: moment('2017-07-01').toDate(),
      endDate: moment('2018-06-30').toDate(),
    });

    const reportModel1 = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-report', report1.id);
    const reports = [reportModel1];
    this.server.get('application/config', function () {
      return {
        config: {
          academicYearCrossesCalendarYearBoundaries: true,
        },
      };
    });
    this.set('reports', reports);
    await render(
      hbs`<CurriculumInventory::ReportList @reports={{this.reports}} @edit={{(noop)}} @remove={{(noop)}} />`
    );
    assert.strictEqual(component.reports[0].year, '2017 - 2018', 'Academic year shows range.');
  });
});
