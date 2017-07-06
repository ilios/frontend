import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import moment from 'moment';

const { RSVP, Object:EmberObject } = Ember;
const { resolve } = RSVP;

moduleForComponent('new-curriculum-inventory-report', 'Integration | Component | new curriculum inventory report', {
  integration: true
});

test('it renders', function(assert) {
  assert.expect(20);

  const program = EmberObject.create({
    id: 1,
    title: 'Doctor of Medicine'
  });
  this.set('program', program);

  this.render(hbs`{{new-curriculum-inventory-report currentProgram=program}}`);

  const currentYear = parseInt(moment().format('YYYY'));
  const currentYearLabel = `${currentYear} - ${currentYear + 1}`;
  const firstYear = currentYear - 5;
  const firstYearLabel = `${firstYear} - ${firstYear + 1}`;
  const lastYear = currentYear + 5;
  const lastYearLabel = `${lastYear} - ${lastYear + 1}`;

  assert.equal(this.$('.program label').text().trim(), 'Program:', 'program title is labeled correctly.');
  assert.equal(this.$('.program .form-data').text().trim(), program.title, 'Program title is displayed.');
  assert.equal(
    this.$('.academic-year label').text().trim(),
    'Academic Year:',
    'Academic year input is labeled correctly.'
  );
  assert.equal(this.$('.academic-year option').length, 11, 'Academic year dropdown has eleven options.');
  assert.equal(
    this.$('.academic-year option').filter(":selected").val(),
    currentYear,
    'Current year is selected by default.'
  );
  assert.equal(
    this.$('.academic-year option').filter(":selected").text().trim(),
    currentYearLabel,
    'Current year label is correct.'
  );
  assert.equal(
    this.$('.academic-year option:eq(0)').val(),
    firstYear,
    'First year in dropdown is five years prior to current year.'
  );
  assert.equal(
    this.$('.academic-year option:eq(0)').text().trim(),
    firstYearLabel,
    'First year label is correct.'
  );
  assert.equal(
    this.$('.academic-year option:eq(10)').val(),
    lastYear,
    'Last year in dropdown is five years ahead of current year.'
  );
  assert.equal(
    this.$('.academic-year option:eq(10)').text().trim(),
    lastYearLabel,
    'Last year label is correct.'
  );
  assert.equal(this.$('.description textarea').length, 1, 'Description input is present.');
  assert.equal(this.$('.description textarea').val(), '', 'Description input is initially empty.');
  assert.equal(this.$('.description label').text().trim(), 'Description:', 'Description input is labeled correctly.');
  assert.equal(this.$('.name input').length, 1, 'Name input is present.');
  assert.equal(this.$('.name input').val(), '', 'Name input is initially empty.');
  assert.equal(this.$('.name label').text().trim(), 'Name:', 'Name input is labeled correctly.');
  assert.equal(this.$('button.done').length, 1, 'Done button is present.');
  assert.equal(this.$('button.done').text().trim(), 'Done', 'Done button is labeled correctly.');
  assert.equal(this.$('button.cancel').length, 1, 'Cancel button is present.');
  assert.equal(this.$('button.cancel').text().trim(), 'Cancel', 'Cancel button is labeled correctly.');
});


test('save', function(assert) {
  assert.expect(6);

  this.set('program', EmberObject.create());
  this.set('saveReport', (report) => {
    const currentYear = parseInt(moment().format('YYYY'));
    const expectedSelectedYear = currentYear - 5;
    assert.equal(report.get('name'), 'new report', 'Name gets passed.');
    assert.equal(report.get('description'), 'lorem ipsum', 'Description gets passed.');
    assert.equal(report.get('year'), expectedSelectedYear, 'Selected academic year gets passed.');
    assert.equal(
      moment(report.get('startDate')).format('YYYY-MM-DD'),
      `${expectedSelectedYear}-07-01`,
      'Start date gets calculated and passed.'
    );
    assert.equal(
      moment(report.get('endDate')).format('YYYY-MM-DD'),
      `${expectedSelectedYear + 1}-06-30`,
      'End date gets calculated and passed.'
    );
    assert.ok(report.get('program'), 'Program gets passed.');
    return resolve(true);
  });

  this.render(hbs`{{new-curriculum-inventory-report currentProgram=program save=(action saveReport)}}`);
  this.$('.name input').val('new report').change();
  this.$('.description textarea').val('lorem ipsum').change();
  this.$('.academic-year option:eq(0)').prop('selected', true).change();
  this.$('button.done').click();
});


test('cancel', function(assert) {
  assert.expect(1);
  this.set('program', EmberObject.create());
  this.set('cancelReport', () => {
    assert.ok(true, 'Cancel action got invoked.');
  });
  this.render(hbs`{{new-curriculum-inventory-report currentProgram=program cancel=(action cancelReport)}}`);
  this.$('button.cancel').click();
});

test('pressing enter in name input field fires save action', function(assert){
  assert.expect(1);

  this.set('program', EmberObject.create());
  this.set('saveReport', () => {
    assert.ok(true, 'Save action got invoked.');
    return resolve(true);
  });

  this.render(hbs`{{new-curriculum-inventory-report currentProgram=program save=(action saveReport)}}`);
  this.$('.name input').val('new report').change();
  // https://github.com/DockYard/ember-one-way-controls/blob/master/tests/integration/components/one-way-input-test.js
  this.$('.name input').trigger($.Event('keyup', { keyCode: 13 }));
});

test('validation errors do not show up initially', function(assert) {
  assert.expect(1);
  this.set('program', EmberObject.create());
  this.render(hbs`{{new-curriculum-inventory-report currentProgram=program}}`);
  assert.equal(this.$('.validation-error-message').length, 0);
});

test('validation errors show up when saving with empty report name', function(assert) {
  assert.expect(1);
  this.set('program', EmberObject.create());
  this.render(hbs`{{new-curriculum-inventory-report currentProgram=program}}`);
  this.$('button.done').click();
  assert.equal(this.$('.validation-error-message').length, 1);
});

test('validation errors show up when saving with a too long report name', function(assert) {
  assert.expect(1);
  this.set('program', EmberObject.create());
  this.render(hbs`{{new-curriculum-inventory-report currentProgram=program}}`);
  this.$('.name input').val('0123456789'.repeat(7)).change();
  this.$('button.done').click();
  assert.equal(this.$('.validation-error-message').length, 1);
});
