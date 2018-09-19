import RSVP from 'rsvp';
import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import {
  render,
  click,
  find,
  findAll,
  fillIn,
  triggerKeyEvent
} from '@ember/test-helpers';
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

    assert.dom('[data-test-program-title] label').hasText('Program:', 'program title is labeled correctly.');
    assert.dom('[data-test-program-title] span').hasText(program.title, 'Program title is displayed.');
    assert.dom('[data-test-academic-year] label').hasText('Academic Year:', 'Academic year input is labeled correctly.');
    assert.dom('[data-test-academic-year] option').exists({ count: 11 }, 'Academic year dropdown has eleven options.');
    const select = find('[data-test-academic-year] select');
    assert.equal(
      select.options[select.selectedIndex].value,
      currentYear,
      'Current year is selected by default.'
    );
    assert.dom(select.options[select.selectedIndex]).hasText(currentYearLabel, 'Current year label is correct.');
    assert.dom('[data-test-academic-year] option').hasValue(firstYear, 'First year in dropdown is five years prior to current year.');
    assert.dom('[data-test-academic-year] option').hasText(firstYearLabel, 'First year label is correct.');
    assert.dom(findAll('[data-test-academic-year] option')[10]).hasValue(lastYear, 'Last year in dropdown is five years ahead of current year.');
    assert.dom(findAll('[data-test-academic-year] option')[10]).hasText(lastYearLabel, 'Last year label is correct.');
    assert.dom('[data-test-description] textarea').exists({ count: 1 }, 'Description input is present.');
    assert.dom('[data-test-description] textarea').hasValue('', 'Description input is initially empty.');
    assert.dom('[data-test-description] label').hasText('Description:', 'Description input is labeled correctly.');
    assert.dom('[data-test-name] input').exists({ count: 1 }, 'Name input is present.');
    assert.dom('[data-test-name] input').hasValue('', 'Name input is initially empty.');
    assert.dom('[data-test-name] label').hasText('Name:', 'Name input is labeled correctly.');
    assert.dom('button.done').exists({ count: 1 }, 'Done button is present.');
    assert.dom('button.done').hasText('Done', 'Done button is labeled correctly.');
    assert.dom('button.cancel').exists({ count: 1 }, 'Cancel button is present.');
    assert.dom('button.cancel').hasText('Cancel', 'Cancel button is labeled correctly.');
  });


  test('save', async function(assert) {
    assert.expect(6);

    this.set('program', EmberObject.create());
    const currentYear = parseInt(moment().format('YYYY'), 10);
    const expectedSelectedYear = currentYear - 5;
    this.set('saveReport', (report) => {
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
    await fillIn('[data-test-name] input', 'new report');
    await fillIn('[data-test-description] textarea', 'lorem ipsum');
    await fillIn('[data-test-academic-year] select', expectedSelectedYear);
    await click('button.done');
  });


  test('cancel', async function(assert) {
    assert.expect(1);
    this.set('program', EmberObject.create());
    this.set('cancelReport', () => {
      assert.ok(true, 'Cancel action got invoked.');
    });
    await render(hbs`{{new-curriculum-inventory-report currentProgram=program cancel=(action cancelReport)}}`);
    await click('button.cancel');
  });

  test('pressing enter in name input field fires save action', async function(assert) {
    assert.expect(1);

    this.set('program', EmberObject.create());
    this.set('saveReport', () => {
      assert.ok(true, 'Save action got invoked.');
      return resolve(true);
    });

    await render(hbs`{{new-curriculum-inventory-report currentProgram=program save=(action saveReport)}}`);
    await fillIn('[data-test-name] input', 'new report');
    await triggerKeyEvent('[data-test-name] input', 'keyup', 13);
  });

  test('validation errors do not show up initially', async function(assert) {
    assert.expect(1);
    this.set('program', EmberObject.create());
    await render(hbs`{{new-curriculum-inventory-report currentProgram=program}}`);
    assert.dom('.validation-error-message').doesNotExist();
  });

  test('validation errors show up when saving with empty report name', async function(assert) {
    assert.expect(1);
    this.set('program', EmberObject.create());
    await render(hbs`{{new-curriculum-inventory-report currentProgram=program}}`);
    await click('button.done');
    assert.dom('.validation-error-message').exists({ count: 1 });
  });

  test('validation errors show up when saving with a too long report name', async function(assert) {
    assert.expect(1);
    this.set('program', EmberObject.create());
    await render(hbs`{{new-curriculum-inventory-report currentProgram=program}}`);
    await fillIn('[data-test-name] input', '0123456789'.repeat(7));
    await click('button.done');
    assert.dom('.validation-error-message').exists({ count: 1 });
  });
});
