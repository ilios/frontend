import { resolve } from 'rsvp';
import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import moment from 'moment';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { component } from 'ilios/tests/pages/components/curriculum-inventory-report-list';

module('Integration | Component | curriculum inventory report list', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function (assert) {
    const school = this.server.create('school');
    const program = this.server.create('program', { school });
    const report1 = this.server.create('curriculum-inventory-report', {
      program,
      name: 'Zeppelin',
      year: 2017,
      startDate: moment('2017-07-01').toDate(),
      endDate: moment('2018-06-30').toDate(),
    });
    const reportExport = this.server.create('curriculum-inventory-export');
    const report2 = this.server.create('curriculum-inventory-report', {
      program,
      export: reportExport,
      name: 'Aardvark',
      year: 2016,
      startDate: moment('2016-07-01').toDate(),
      endDate: moment('2017-06-30').toDate(),
    });

    const permissionCheckerMock = Service.extend({
      canDeleteCurriculumInventoryReport() {
        return resolve(true);
      }
    });
    this.owner.register('service:permission-checker', permissionCheckerMock);

    const reports = [report1, report2];
    const programModel = await this.owner.lookup('service:store').find('program', program.id);

    this.set('program', programModel);
    await render(hbs`<CurriculumInventoryReportList @program={{this.program}} />`);
    assert.equal(component.headers.name, 'Report Name', 'First column table header is labeled correctly');
    assert.equal(component.headers.program, 'Program', 'Second column table header is labeled correctly');
    assert.equal(component.headers.year, 'Academic Year', 'Third column table header is labeled correctly');
    assert.equal(component.headers.startDate, 'Start Date', 'Fourth column table header is labeled correctly');
    assert.equal(component.headers.endDate, 'End Date', 'Fifth column table header is labeled correctly');
    assert.equal(component.headers.status, 'Status', 'Sixth column table header is labeled correctly');
    assert.equal(component.headers.actions, 'Actions', 'Seventh column table header is labeled correctly');
    assert.equal(component.reports.length, reports.length, 'All reports are shown in list.');
    assert.equal(component.reports[0].name, report2.name, 'Report name shows.');
    assert.equal(component.reports[0].program, program.title, 'Program title shows.');
    assert.equal(component.reports[0].year, '2016 - 2017', 'Academic year shows.');
    assert.equal(component.reports[0].startDate, moment(report2.startDate).format('L'), 'Start date shows.');
    assert.equal(component.reports[0].endDate, moment(report2.endDate).format('L'), 'End date shows.');
    assert.equal(component.reports[0].status, 'Finalized', 'Status shows.');
    assert.notOk(component.reports[0].isDeletable, 'Delete button is disabled for finalized reports.');
    assert.equal(component.reports[1].name, report1.name, 'Report name shows.');
    assert.equal(component.reports[1].program, program.title, 'Program title shows.');
    assert.equal(component.reports[1].year, '2017 - 2018', 'Academic year shows.');
    assert.equal(component.reports[1].startDate, moment(report1.startDate).format('L'), 'Start date shows.');
    assert.equal(component.reports[1].endDate, moment(report1.endDate).format('L'), 'End date shows.');
    assert.equal(component.reports[1].status, 'Draft', 'Status shows.');
    assert.ok(component.reports[1].isDeletable, 'Delete button is enabled for reports in draft.');
  });

  test('empty list', async function (assert) {
    const school = this.server.create('school');
    const program = this.server.create('program', { school });
    const programModel = await this.owner.lookup('service:store').find('program', program.id);

    this.set('program', programModel);
    await render(hbs`<CurriculumInventoryReportList @program={{this.program}} />`);
    assert.equal(component.emptyList.text, 'None');
  });

  test('delete and confirm', async function(assert) {
    assert.expect(3);
    const school = this.server.create('school');
    const program = this.server.create('program', { school });
    const report = this.server.create('curriculum-inventory-report', {
      program,
      name: 'Zeppelin',
    });
    const programModel = await this.owner.lookup('service:store').find('program', program.id);

    const permissionCheckerMock = Service.extend({
      canDeleteCurriculumInventoryReport() {
        return resolve(true);
      }
    });
    this.owner.register('service:permission-checker', permissionCheckerMock);

    this.set('program', programModel);
    this.set('removeAction', (obj) => {
      assert.equal(report.id, obj.id, 'Report is passed to remove action.');
    });
    await render(hbs`<CurriculumInventoryReportList @program={{this.program}} @remove={{this.removeAction}} />`);
    assert.notOk(component.confirmRemoval.isVisible, 'Confirm dialog is initially not visible.');
    await component.reports[0].remove();
    assert.ok(component.confirmRemoval.isVisible, 'Confirm dialog shows.');
    await component.confirmRemoval.confirm();
  });

  test('delete and cancel', async function(assert) {
    assert.expect(3);
    const school = this.server.create('school');
    const program = this.server.create('program', { school });
    this.server.create('curriculum-inventory-report', {
      program,
      name: 'Zeppelin',
    });
    const permissionCheckerMock = Service.extend({
      canDeleteCurriculumInventoryReport() {
        return resolve(true);
      }
    });
    this.owner.register('service:permission-checker', permissionCheckerMock);
    const programModel = await this.owner.lookup('service:store').find('program', program.id);

    this.set('program', programModel);
    this.set('removeAction', () => {
      assert.ok(false, 'Remove action should not have been invoked.');
    });
    await render(hbs`<CurriculumInventoryReportList @program={{this.program}} @remove={{this.removeAction}} />`);
    assert.notOk(component.confirmRemoval.isVisible, 'Confirm dialog is initially not visible.');
    await component.reports[0].remove();
    assert.ok(component.confirmRemoval.isVisible, 'Confirm dialog shows.');
    await component.confirmRemoval.cancel();
    assert.notOk(component.confirmRemoval.isVisible, 'Confirm dialog is invisible again.');
  });

  test('sorting', async function(assert) {
    assert.expect(4);
    const school = this.server.create('school');
    const program = this.server.create('program', { school });
    this.server.create('curriculum-inventory-report', {
      program,
      name: 'Zeppelin',
    });
    const programModel = await this.owner.lookup('service:store').find('program', program.id);

    let count = 0;
    const sortBys = ['name', 'name:desc', 'year', 'year:desc'];

    this.set('program', programModel);
    this.set('sortBy', 'id');
    this.set('setSortBy', (what) => {
      assert.equal(what, sortBys[count]);
      this.set('sortBy', what);
      count++;
    });
    await render(hbs`<CurriculumInventoryReportList
      @program={{this.program}}
      @setSortBy={{this.setSortBy}}
      @sortBy={{this.sortBy}}
    />`);
    await component.headers.clickOnName();
    await component.headers.clickOnName();
    await component.headers.clickOnYear();
    await component.headers.clickOnYear();
  });

  test('edit', async function(assert) {
    assert.expect(5);
    const school = this.server.create('school');
    const program = this.server.create('program', { school });
    const report = this.server.create('curriculum-inventory-report', {
      program,
      name: 'Zeppelin',
    });
    const programModel = await this.owner.lookup('service:store').find('program', program.id);

    this.set('program', programModel);
    this.set('editAction', (obj) => {
      assert.equal(report.id, obj.id, 'Report is passed to edit action.');
    });
    await render(hbs`<CurriculumInventoryReportList @program={{this.program}} @edit={{this.editAction}} />`);
    await component.reports[0].clickOnName();
    await component.reports[0].clickOnProgram();
    await component.reports[0].clickOnYear();
    await component.reports[0].clickOnStartDate();
    await component.reports[0].clickOnEndDate();
    await component.reports[0].clickOnStatus();
  });
});
