import { resolve } from 'rsvp';
import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render, findAll, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import moment from 'moment';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { run } from '@ember/runloop';

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
    const programModel = await run(() => this.owner.lookup('service:store').find('program', program.id));

    this.set('program', programModel);
    await render(hbs`{{curriculum-inventory-report-list program=program}}`);
    assert.equal(findAll('th').length, 7, 'Table header has seven columns.');
    assert.equal(find('th').textContent.trim(), 'Report Name', 'First column table header is labeled correctly');
    assert.equal(findAll('th')[1].textContent.trim(), 'Program', 'Second column table header is labeled correctly');
    assert.equal(findAll('th')[2].textContent.trim(), 'Academic Year', 'Third column table header is labeled correctly');
    assert.equal(findAll('th')[3].textContent.trim(), 'Start Date', 'Fourth column table header is labeled correctly');
    assert.equal(findAll('th')[4].textContent.trim(), 'End Date', 'Fifth column table header is labeled correctly');
    assert.equal(findAll('th')[5].textContent.trim(), 'Status', 'Sixth column table header is labeled correctly');
    assert.equal(findAll('th')[6].textContent.trim(), 'Actions', 'Seventh column table header is labeled correctly');
    assert.equal(findAll('tbody tr').length, reports.length, 'All reports are shown in list.');

    assert.equal(findAll('tbody tr').length, 2);
    assert.equal(find(`[data-test-report="0"] [data-test-name]`).textContent.trim(), report1.name, 'Report name shows.');
    assert.equal(
      find(`[data-test-report="0"] [data-test-program]`).textContent.trim(),
      program.title,
      'Program title shows.'
    );
    assert.equal(
      find(`[data-test-report="0"] [data-test-year]`).textContent.trim(),
      '2017 - 2018',
      'Academic year shows.'
    );
    assert.equal(find(`[data-test-report="0"] [data-test-start-date]`).textContent.trim(),
      moment(report1.startDate).format('L'),
      'Start date shows.'
    );
    assert.equal(find(`[data-test-report="0"] [data-test-end-date]`).textContent.trim(),
      moment(report1.endDate).format('L'),
      'End date shows.'
    );
    assert.equal(find(`[data-test-report="0"] [data-test-status]`).textContent.trim(),
      'Draft',
      'Status shows.'
    );
    assert.equal(findAll(`[data-test-report="0"] [data-test-actions] .fa-edit`).length, 1, 'Edit button shows.');
    assert.equal(findAll(`[data-test-report="0"] [data-test-actions] .fa-download`).length, 1, 'Download button shows.');
    assert.equal(
      findAll(`[data-test-report="0"] [data-test-actions] .fa-trash`).length,
      1,
      'Delete button shows for reports in draft.'
    );

    assert.equal(find(`[data-test-report="1"] [data-test-name]`).textContent.trim(), report2.name, 'Report name shows.');
    assert.equal(
      find(`[data-test-report="1"] [data-test-program]`).textContent.trim(),
      program.title,
      'Program title shows.'
    );
    assert.equal(
      find(`[data-test-report="1"] [data-test-year]`).textContent.trim(),
      '2016 - 2017',
      'Academic year shows.'
    );
    assert.equal(find(`[data-test-report="1"] [data-test-start-date]`).textContent.trim(),
      moment(report2.startDate).format('L'),
      'Start date shows.'
    );
    assert.equal(find(`[data-test-report="1"] [data-test-end-date]`).textContent.trim(),
      moment(report2.endDate).format('L'),
      'End date shows.'
    );
    assert.equal(find(`[data-test-report="1"] [data-test-status]`).textContent.trim(),
      'Finalized',
      'Status shows.'
    );
    assert.equal(findAll(`[data-test-report="1"] [data-test-actions] .fa-edit`).length, 1, 'Edit button shows.');
    assert.equal(findAll(`[data-test-report="1"] [data-test-actions] .fa-download`).length, 1, 'Download button shows.');
    assert.equal(
      findAll(`[data-test-report="1"] [data-test-actions] .fa-trash`).length,
      0,
      'Delete button is not visible for finalized reports.'
    );
  });

  test('empty list', async function (assert) {
    const school = this.server.create('school');
    const program = this.server.create('program', { school });
    const programModel = await run(() => this.owner.lookup('service:store').find('program', program.id));

    this.set('program', programModel);
    await render(hbs`{{curriculum-inventory-report-list program=program}}`);
    assert.equal(findAll('thead tr').length, 1, 'Table header shows.');
    assert.equal(findAll('tbody').length, 1, 'Table body shows.');
    assert.equal(findAll('tbody tr').length, 0, 'Table body is empty.');
  });

  test('delete and confirm', async function(assert) {
    assert.expect(3);
    const school = this.server.create('school');
    const program = this.server.create('program', { school });
    const report = this.server.create('curriculum-inventory-report', {
      program,
      name: 'Zeppelin',
    });
    const programModel = await run(() => this.owner.lookup('service:store').find('program', program.id));

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
    await render(hbs`{{curriculum-inventory-report-list program=program remove=removeAction}}`);
    assert.equal(findAll('.confirm-removal').length, 0, 'Confirm dialog is initially not visible.');
    await click('[data-test-report="0"] .remove');
    assert.equal(findAll('.confirm-removal').length, 2, 'Confirm dialog shows.');
    await click('[data-test-confirm-removal="0"] .remove');
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
    const programModel = await run(() => this.owner.lookup('service:store').find('program', program.id));

    this.set('program', programModel);
    this.set('removeAction', () => {
      assert.ok(false, 'Remove action should not have been invoked.');
    });
    await render(hbs`{{curriculum-inventory-report-list program=program remove=removeAction}}`);
    assert.equal(findAll('.confirm-removal').length, 0, 'Confirm dialog is initially not visible.');
    await click('[data-test-report="0"] .remove');
    assert.equal(findAll('.confirm-removal').length, 2, 'Confirm dialog shows.');
    await click('[data-test-confirm-removal="0"] .done');
    assert.equal(findAll('.confirm-removal').length, 0, 'Confirm dialog is invisible again.');
  });

  test('sorting', async function(assert) {
    assert.expect(4);
    const school = this.server.create('school');
    const program = this.server.create('program', { school });
    this.server.create('curriculum-inventory-report', {
      program,
      name: 'Zeppelin',
    });
    const programModel = await run(() => this.owner.lookup('service:store').find('program', program.id));

    let count = 0;
    let sortBys = ['name', 'name:desc', 'year', 'year:desc'];

    this.set('program', programModel);
    this.set('sortBy', 'id');
    this.set('setSortBy', (what) => {
      assert.equal(what, sortBys[count]);
      this.set('sortBy', what);
      count++;
    });
    await render(hbs`{{curriculum-inventory-report-list program=program setSortBy=(action setSortBy) sortBy=sortBy}}`);
    await click(`th:nth-of-type(1)`);
    await click(`th:nth-of-type(1)`);
    await click(`th:nth-of-type(3)`);
    await click(`th:nth-of-type(3)`);
  });

  test('edit', async function(assert) {
    assert.expect(5);
    const school = this.server.create('school');
    const program = this.server.create('program', { school });
    const report = this.server.create('curriculum-inventory-report', {
      program,
      name: 'Zeppelin',
    });
    const programModel = await run(() => this.owner.lookup('service:store').find('program', program.id));

    this.set('program', programModel);
    this.set('editAction', (obj) => {
      assert.equal(report.id, obj.id, 'Report is passed to edit action.');
    });
    await render(hbs`{{curriculum-inventory-report-list program=program edit=editAction}}`);
    await click(`tbody tr:nth-of-type(1) td:nth-of-type(2)`);
    await click(`tbody tr:nth-of-type(1) td:nth-of-type(3)`);
    await click(`tbody tr:nth-of-type(1) td:nth-of-type(4)`);
    await click(`tbody tr:nth-of-type(1) td:nth-of-type(5)`);
    await click(`tbody tr:nth-of-type(1) td:nth-of-type(6)`);
  });
});
