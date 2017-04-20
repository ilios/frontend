import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';
import moment from 'moment';
const { Object:EmberObject, RSVP } = Ember;
const { resolve } = RSVP;

moduleForComponent('curriculum-inventory-report-list', 'Integration | Component | curriculum inventory report list', {
  integration: true,
});

test('it renders', function(assert) {
  let report1 = EmberObject.create({
    id: 1,
    name: 'Zeppelin',
    year: 2017,
    yearLabel: '2017 - 2018',
    startDate: moment('2017-07-01').toDate(),
    endDate: moment('2018-06-30').toDate(),
    program: EmberObject.create({
      'title': 'Doctor of Medicine'
    }),
    isFinalized: false,
  });
  let report2 = EmberObject.create({
    id: 2,
    name: 'Aardvark',
    year: 2016,
    startDate: moment('2016-07-01').toDate(),
    endDate: moment('2017-06-30').toDate(),
    yearLabel: '2016 - 2017',
    program: EmberObject.create({
      'title': 'Doctor of Rocket Surgery'
    }),
    isFinalized: true,
  });

  const reports = [ report1, report2 ];

  const program = EmberObject.create({
    curriculumInventoryReports: resolve(reports)
  });

  this.set('program', program);
  this.render(hbs`{{curriculum-inventory-report-list program=program}}`);
  assert.equal(this.$('th').length, 7, 'Table header has seven columns.');
  assert.equal(this.$('th:eq(0)').text().trim(), 'Report Name', 'First column table header is labeled correctly');
  assert.equal(this.$('th:eq(1)').text().trim(), 'Program', 'Second column table header is labeled correctly');
  assert.equal(this.$('th:eq(2)').text().trim(), 'Academic Year', 'Third column table header is labeled correctly');
  assert.equal(this.$('th:eq(3)').text().trim(), 'Start Date', 'Fourth column table header is labeled correctly');
  assert.equal(this.$('th:eq(4)').text().trim(), 'End Date', 'Fifth column table header is labeled correctly');
  assert.equal(this.$('th:eq(5)').text().trim(), 'Status', 'Sixth column table header is labeled correctly');
  assert.equal(this.$('th:eq(6)').text().trim(), 'Actions', 'Seventh column table header is labeled correctly');
  assert.equal(this.$('tbody tr').length, reports.length, 'All reports are shown in list.');
  for (let i = 0, n = reports.length; i < n; i++) {
    let report = reports[i];
    assert.equal(this.$(`tbody tr:eq(${i}) td:eq(0)`).text().trim(), report.get('name'), 'Report name shows.');
    assert.equal(
      this.$(`tbody tr:eq(${i}) td:eq(1)`).text().trim(),
      report.get('program').get('title'),
      'Program title shows.'
    );
    assert.equal(
      this.$(`tbody tr:eq(${i}) td:eq(2)`).text().trim(),
      report.get('yearLabel'),
      'Academic year shows.'
    );
    assert.equal(this.$(`tbody tr:eq(${i}) td:eq(3)`).text().trim(),
      moment(report.get('startDate')).format('L'),
      'Start date shows.'
    );
    assert.equal(this.$(`tbody tr:eq(${i}) td:eq(4)`).text().trim(),
      moment(report.get('endDate')).format('L'),
      'End date shows.'
    );
    assert.equal(this.$(`tbody tr:eq(${i}) td:eq(5)`).text().trim(),
      report.get('isFinalized') ? 'Finalized' : 'Draft',
      'Status shows.'
    );
    assert.equal(this.$(`tbody tr:eq(${i}) td:eq(6) .fa-edit`).length, 1, 'Edit button shows.');
    assert.equal(this.$(`tbody tr:eq(${i}) td:eq(6) .fa-download`).length, 1, 'Download button shows.');
    if (report.get('isFinalized')) {
      assert.equal(
        this.$(`tbody tr:eq(${i}) td:eq(6) .fa-trash`).length,
        0,
        'Delete button is not visible for finalized reports.'
      );
    } else {
      assert.equal(
        this.$(`tbody tr:eq(${i}) td:eq(6) .fa-trash`).length,
        1,
        'Delete button shows for reports in draft.'
      );
    }
  }
});

test('empty list', function(assert) {
  const program = EmberObject.create({
    curriculumInventoryReports: resolve([])
  });

  this.set('program', program);
  this.render(hbs`{{curriculum-inventory-report-list program=program}}`);
  assert.equal(this.$('thead tr').length, 1, 'Table header shows.');
  assert.equal(this.$('tbody').length, 1, 'Table body shows.');
  assert.equal(this.$('tbody tr').length, 0, 'Table body is empty.');
});

test('delete and confirm', function(assert) {
  assert.expect(3);
  let report = EmberObject.create();
  let removeAction =  function(obj) {
    assert.equal(report, obj, 'Report is passed to remove action.');
  };
  const program = EmberObject.create({
    curriculumInventoryReports: resolve([ report ])
  });

  this.set('program', program);
  this.set('removeAction', removeAction);
  this.render(hbs`{{curriculum-inventory-report-list program=program remove=removeAction}}`);
  assert.equal(this.$('.confirm-removal').length, 0, 'Confirm dialog is initially not visible.');
  this.$(`tbody tr:eq(0) .remove`).click();
  assert.equal(this.$('.confirm-removal').length, 2, 'Confirm dialog shows.');
  this.$(`.confirm-removal .remove`).click();
});

test('delete and cancel', function(assert) {
  assert.expect(3);
  let report = EmberObject.create();
  let removeAction =  function() {
    assert.ok(false, 'Remove action should not have been invoked.');
  };
  const program = EmberObject.create({
    curriculumInventoryReports: resolve([ report ])
  });

  this.set('program', program);
  this.set('removeAction', removeAction);
  this.render(hbs`{{curriculum-inventory-report-list program=program remove=removeAction}}`);
  assert.equal(this.$('.confirm-removal').length, 0, 'Confirm dialog is initially not visible.');
  this.$(`tbody tr:eq(0) .remove`).click();
  assert.equal(this.$('.confirm-removal').length, 2, 'Confirm dialog shows.');
  this.$(`.confirm-removal .done`).click();
  assert.equal(this.$('.confirm-removal').length, 0, 'Confirm dialog is invisible again.');
});

test('sorting', function(assert) {
  assert.expect(4);
  let report = EmberObject.create();
  let count = 0;
  let sortBys = ['name', 'name:desc', 'year', 'year:desc'];
  const program = EmberObject.create({
    curriculumInventoryReports: resolve([ report ])
  });

  this.set('program', program);
  this.set('sortBy', 'id');
  this.set('setSortBy', (what) => {
    assert.equal(what, sortBys[count]);
    this.set('sortBy', what);
    count++;
  });
  this.render(hbs`{{curriculum-inventory-report-list program=program setSortBy=(action setSortBy) sortBy=sortBy}}`);
  this.$(`th:eq(0)`).click();
  this.$(`th:eq(0)`).click();
  this.$(`th:eq(2)`).click();
  this.$(`th:eq(2)`).click();
});

test('edit', function(assert) {
  assert.expect(5);
  let report = EmberObject.create({ id: 1 });
  let editAction =  function(obj) {
    assert.equal(report, obj, 'Report is passed to edit action.');
  };
  const program = EmberObject.create({
    curriculumInventoryReports: resolve([ report ])
  });

  this.set('program', program);
  this.set('editAction', editAction);
  this.render(hbs`{{curriculum-inventory-report-list program=program edit=editAction}}`);
  this.$(`tbody tr:eq(0) td:eq(1)`).click();
  this.$(`tbody tr:eq(0) td:eq(2)`).click();
  this.$(`tbody tr:eq(0) td:eq(3)`).click();
  this.$(`tbody tr:eq(0) td:eq(4)`).click();
  this.$(`tbody tr:eq(0) td:eq(5)`).click();
});
