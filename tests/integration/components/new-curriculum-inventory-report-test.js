import { resolve } from 'rsvp';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, find, findAll, fillIn, triggerKeyEvent } from '@ember/test-helpers';
import { run } from '@ember/runloop';
import hbs from 'htmlbars-inline-precompile';
import moment from 'moment';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Integration | Component | new curriculum inventory report', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function(assert) {
    assert.expect(20);

    const program = this.server.create('program', { id: 1, title: 'Doctor of Medicine' });
    const programModel = await run(() => this.owner.lookup('service:store').find('program', program.id));

    this.set('program', programModel);

    await render(hbs`{{new-curriculum-inventory-report currentProgram=program}}`);

    const currentYear = parseInt(moment().format('YYYY'), 10);
    const currentYearLabel = `${currentYear} - ${currentYear + 1}`;
    const firstYear = currentYear - 5;
    const firstYearLabel = `${firstYear} - ${firstYear + 1}`;
    const lastYear = currentYear + 5;
    const lastYearLabel = `${lastYear} - ${lastYear + 1}`;

    assert.equal(find('[data-test-program-title] label').textContent.trim(), 'Program:', 'program title is labeled correctly.');
    assert.equal(find('[data-test-program-title] span').textContent.trim(), program.title, 'Program title is displayed.');
    assert.equal(
      find('[data-test-academic-year] label').textContent.trim(),
      'Academic Year:',
      'Academic year input is labeled correctly.'
    );
    assert.equal(findAll('[data-test-academic-year] option').length, 11, 'Academic year dropdown has eleven options.');
    const select = find('[data-test-academic-year] select');
    assert.equal(
      select.options[select.selectedIndex].value,
      currentYear,
      'Current year is selected by default.'
    );
    assert.equal(
      select.options[select.selectedIndex].textContent.trim(),
      currentYearLabel,
      'Current year label is correct.'
    );
    assert.equal(
      find('[data-test-academic-year] option').value,
      firstYear,
      'First year in dropdown is five years prior to current year.'
    );
    assert.equal(
      find('[data-test-academic-year] option').textContent.trim(),
      firstYearLabel,
      'First year label is correct.'
    );
    assert.equal(
      find(findAll('[data-test-academic-year] option')[10]).value,
      lastYear,
      'Last year in dropdown is five years ahead of current year.'
    );
    assert.equal(
      find(findAll('[data-test-academic-year] option')[10]).textContent.trim(),
      lastYearLabel,
      'Last year label is correct.'
    );
    assert.equal(findAll('[data-test-description] textarea').length, 1, 'Description input is present.');
    assert.equal(find('[data-test-description] textarea').value, '', 'Description input is initially empty.');
    assert.equal(find('[data-test-description] label').textContent.trim(), 'Description:', 'Description input is labeled correctly.');
    assert.equal(findAll('[data-test-name] input').length, 1, 'Name input is present.');
    assert.equal(find('[data-test-name] input').value, '', 'Name input is initially empty.');
    assert.equal(find('[data-test-name] label').textContent.trim(), 'Name:', 'Name input is labeled correctly.');
    assert.equal(findAll('button.done').length, 1, 'Done button is present.');
    assert.equal(find('button.done').textContent.trim(), 'Done', 'Done button is labeled correctly.');
    assert.equal(findAll('button.cancel').length, 1, 'Cancel button is present.');
    assert.equal(find('button.cancel').textContent.trim(), 'Cancel', 'Cancel button is labeled correctly.');
  });


  test('save', async function(assert) {
    assert.expect(6);

    const program = this.server.create('program', { id: 1, title: 'Doctor of Medicine' });
    const programModel = await run(() => this.owner.lookup('service:store').find('program', program.id));

    this.set('program', programModel);
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
    const program = this.server.create('program', { id: 1, title: 'Doctor of Medicine' });
    const programModel = await run(() => this.owner.lookup('service:store').find('program', program.id));

    this.set('program', programModel);
    this.set('cancelReport', () => {
      assert.ok(true, 'Cancel action got invoked.');
    });
    await render(hbs`{{new-curriculum-inventory-report currentProgram=program cancel=(action cancelReport)}}`);
    await click('button.cancel');
  });

  test('pressing enter in name input field fires save action', async function(assert) {
    assert.expect(1);

    const program = this.server.create('program', { id: 1, title: 'Doctor of Medicine' });
    const programModel = await run(() => this.owner.lookup('service:store').find('program', program.id));

    this.set('program', programModel);
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
    const program = this.server.create('program', { id: 1, title: 'Doctor of Medicine' });
    const programModel = await run(() => this.owner.lookup('service:store').find('program', program.id));

    this.set('program', programModel);
    await render(hbs`{{new-curriculum-inventory-report currentProgram=program}}`);
    assert.equal(findAll('.validation-error-message').length, 0);
  });

  test('validation errors show up when saving with empty report name', async function(assert) {
    assert.expect(1);
    const program = this.server.create('program', { id: 1, title: 'Doctor of Medicine' });
    const programModel = await run(() => this.owner.lookup('service:store').find('program', program.id));

    this.set('program', programModel);
    await render(hbs`{{new-curriculum-inventory-report currentProgram=program}}`);
    await click('button.done');
    assert.equal(findAll('.validation-error-message').length, 1);
  });

  test('validation errors show up when saving with a too long report name', async function(assert) {
    assert.expect(1);
    const program = this.server.create('program', { id: 1, title: 'Doctor of Medicine' });
    const programModel = await run(() => this.owner.lookup('service:store').find('program', program.id));

    this.set('program', programModel);
    await render(hbs`{{new-curriculum-inventory-report currentProgram=program}}`);
    await fillIn('[data-test-name] input', '0123456789'.repeat(7));
    await click('button.done');
    assert.equal(findAll('.validation-error-message').length, 1);
  });
});
