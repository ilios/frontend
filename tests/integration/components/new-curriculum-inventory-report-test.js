import RSVP from 'rsvp';
import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import moment from 'moment';

const { resolve } = RSVP;

module('Integration | Component | new curriculum inventory report', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    assert.expect(20);

    const program = EmberObject.create({
      id: 1,
      title: 'Doctor of Medicine'
    });
    this.set('program', program);

    await render(hbs`{{new-curriculum-inventory-report currentProgram=program}}`);

    const currentYear = parseInt(moment().format('YYYY'), 10);
    const currentYearLabel = `${currentYear} - ${currentYear + 1}`;
    const firstYear = currentYear - 5;
    const firstYearLabel = `${firstYear} - ${firstYear + 1}`;
    const lastYear = currentYear + 5;
    const lastYearLabel = `${lastYear} - ${lastYear + 1}`;

    assert.equal(this.$('[data-test-program-title] label').text().trim(), 'Program:', 'program title is labeled correctly.');
    assert.equal(this.$('[data-test-program-title] span').text().trim(), program.title, 'Program title is displayed.');
    assert.equal(
      this.$('[data-test-academic-year] label').text().trim(),
      'Academic Year:',
      'Academic year input is labeled correctly.'
    );
    assert.equal(this.$('[data-test-academic-year] option').length, 11, 'Academic year dropdown has eleven options.');
    assert.equal(
      this.$('[data-test-academic-year] option').filter(":selected").val(),
      currentYear,
      'Current year is selected by default.'
    );
    assert.equal(
      this.$('[data-test-academic-year] option').filter(":selected").text().trim(),
      currentYearLabel,
      'Current year label is correct.'
    );
    assert.equal(
      this.$('[data-test-academic-year] option:eq(0)').val(),
      firstYear,
      'First year in dropdown is five years prior to current year.'
    );
    assert.equal(
      this.$('[data-test-academic-year] option:eq(0)').text().trim(),
      firstYearLabel,
      'First year label is correct.'
    );
    assert.equal(
      this.$('[data-test-academic-year] option:eq(10)').val(),
      lastYear,
      'Last year in dropdown is five years ahead of current year.'
    );
    assert.equal(
      this.$('[data-test-academic-year] option:eq(10)').text().trim(),
      lastYearLabel,
      'Last year label is correct.'
    );
    assert.equal(this.$('[data-test-description] textarea').length, 1, 'Description input is present.');
    assert.equal(this.$('[data-test-description] textarea').val(), '', 'Description input is initially empty.');
    assert.equal(this.$('[data-test-description] label').text().trim(), 'Description:', 'Description input is labeled correctly.');
    assert.equal(this.$('[data-test-name] input').length, 1, 'Name input is present.');
    assert.equal(this.$('[data-test-name] input').val(), '', 'Name input is initially empty.');
    assert.equal(this.$('[data-test-name] label').text().trim(), 'Name:', 'Name input is labeled correctly.');
    assert.equal(this.$('button.done').length, 1, 'Done button is present.');
    assert.equal(this.$('button.done').text().trim(), 'Done', 'Done button is labeled correctly.');
    assert.equal(this.$('button.cancel').length, 1, 'Cancel button is present.');
    assert.equal(this.$('button.cancel').text().trim(), 'Cancel', 'Cancel button is labeled correctly.');
  });


  test('save', async function(assert) {
    assert.expect(6);

    this.set('program', EmberObject.create());
    this.set('saveReport', (report) => {
      const currentYear = parseInt(moment().format('YYYY'), 10);
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

    await render(hbs`{{new-curriculum-inventory-report currentProgram=program save=(action saveReport)}}`);
    this.$('[data-test-name] input').val('new report').trigger('input');
    this.$('[data-test-description] textarea').val('lorem ipsum').trigger('input');
    this.$('[data-test-academic-year] option:eq(0)').prop('selected', true).change();
    this.$('button.done').click();
  });


  test('cancel', async function(assert) {
    assert.expect(1);
    this.set('program', EmberObject.create());
    this.set('cancelReport', () => {
      assert.ok(true, 'Cancel action got invoked.');
    });
    await render(hbs`{{new-curriculum-inventory-report currentProgram=program cancel=(action cancelReport)}}`);
    this.$('button.cancel').click();
  });

  test('pressing enter in name input field fires save action', async function(assert) {
    assert.expect(1);

    this.set('program', EmberObject.create());
    this.set('saveReport', () => {
      assert.ok(true, 'Save action got invoked.');
      return resolve(true);
    });

    await render(hbs`{{new-curriculum-inventory-report currentProgram=program save=(action saveReport)}}`);
    this.$('[data-test-name] input').val('new report').trigger('input');
    // https://github.com/DockYard/ember-one-way-controls/blob/master/tests/integration/components/one-way-input-test.js
    this.$('[data-test-name] input').trigger($.Event('keyup', { keyCode: 13 }));
  });

  test('validation errors do not show up initially', async function(assert) {
    assert.expect(1);
    this.set('program', EmberObject.create());
    await render(hbs`{{new-curriculum-inventory-report currentProgram=program}}`);
    assert.equal(this.$('.validation-error-message').length, 0);
  });

  test('validation errors show up when saving with empty report name', async function(assert) {
    assert.expect(1);
    this.set('program', EmberObject.create());
    await render(hbs`{{new-curriculum-inventory-report currentProgram=program}}`);
    this.$('button.done').click();
    assert.equal(this.$('.validation-error-message').length, 1);
  });

  test('validation errors show up when saving with a too long report name', async function(assert) {
    assert.expect(1);
    this.set('program', EmberObject.create());
    await render(hbs`{{new-curriculum-inventory-report currentProgram=program}}`);
    this.$('[data-test-name] input').val('0123456789'.repeat(7)).trigger('input');
    this.$('button.done').click();
    assert.equal(this.$('.validation-error-message').length, 1);
  });
});
