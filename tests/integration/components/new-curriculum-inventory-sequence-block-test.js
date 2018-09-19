import { resolve } from 'rsvp';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import {
  render,
  click,
  find,
  findAll,
  fillIn
} from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import moment from 'moment';
import { openDatepicker } from 'ember-pikaday/helpers/pikaday';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { run } from '@ember/runloop';

module('Integration | Component | new curriculum inventory sequence block', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function(assert) {
    assert.expect(69);

    const school = this.server.create('school');
    const academicLevels = this.server.createList('curriculum-inventory-academic-level', 10);

    const course1 = this.server.create('course', { school, published: true, title: 'Belial', year: '2016' });
    const course2 = this.server.create('course', { school, published: true, title: 'Behemoth', year: '2016' });
    const course3 = this.server.create('course', { school, published: true, title: 'Beelzebub', year: '2016' });
    const program = this.server.create('program', { school });
    const report = this.server.create('curriculum-inventory-report', {
      academicLevels,
      year: '2016',
      published: true,
      program,
    });
    this.server.create('curriculum-inventory-sequence-block', {
      course: course2,
      report
    });

    const reportModel = await run(() => this.owner.lookup('service:store').find('curriculum-inventory-report', report.id));

    this.set('report', reportModel);
    await render(hbs`{{new-curriculum-inventory-sequence-block report=report}}`);
    assert.dom('h2.title').hasText('New Sequence Block', 'Component title shows.');
    assert.dom('.title label').hasText('Title:', 'Title label is correct.');
    assert.dom('.title input').hasValue('', 'Title input is initially empty.');
    assert.dom('.description label').hasText('Description:', 'Description label is correct.');
    assert.dom('.description textarea').hasValue('', 'Description input is initially empty.');
    assert.dom('.course label').hasText('Course:', 'Course label is correct.');
    assert.dom('.course option').exists({ count: 3 }, 'Course dropdown has correct number of options');
    assert.dom('.course option').hasValue('', 'First course option has no value.');
    assert.dom('.course option').hasText('Select a Course', 'First course option is labeled correctly');
    assert.dom(`.course option:nth-of-type(2)`).hasValue(course3.id, 'Second course option has correct value');
    assert.dom(`.course option:nth-of-type(2)`).hasText(course3.title, 'Second course option is labeled correctly');
    assert.dom(`.course option:nth-of-type(3)`).hasValue(course1.id, 'Third course option has correct value');
    assert.dom(`.course option:nth-of-type(3)`).hasText(course1.title, 'Third course option is labeled correctly');
    assert.dom(`.required label`).hasText('Required:', 'Required label is correct');
    assert.dom(`.required option`).exists({ count: 3 }, 'There are three required options');
    assert.dom(`.required option:nth-of-type(1)`).hasValue('1', 'Required option value is correct.');
    assert.dom(`.required option:nth-of-type(1)`).hasText('Required', 'Required option label is correct.');
    assert.dom(`.required option:nth-of-type(2)`).hasValue('2', 'Required option value is correct.');
    assert.dom(`.required option:nth-of-type(2)`).hasText('Optional (elective)', 'Required option label is correct.');
    assert.dom(`.required option:nth-of-type(3)`).hasValue('3', 'Required option value is correct.');
    assert.dom(`.required option:nth-of-type(3)`).hasText('Required In Track', 'Required option label is correct.');
    assert.dom(`.track label`).hasText('Is Track?', 'Track label is correct');
    assert.dom(`.track .toggle-yesno`).exists({ count: 1 }, 'Track switcher is visible.');
    assert.dom(`.start-date label`).hasText('Start Date:', 'Start date label is correct.');
    assert.dom(`.start-date input`).hasValue('', 'Start date input is initially empty.');
    assert.dom(`.end-date label`).hasText('End Date:', 'End date label is correct.');
    assert.dom(`.end-date input`).hasValue('', 'End date input is initially empty.');
    assert.dom(`.duration label`).hasText('Duration (in Days):', 'Duration label is correct.');
    assert.dom(`.duration input`).hasValue('0', 'Duration input has initial value of zero.');
    assert.dom(`.clear-dates button`).hasText('Clear Dates', 'Clear dates button is labeled correctly.');
    assert.dom(`.minimum label`).hasText('Minimum:', 'Minimum label is correct.');
    assert.dom(`.minimum input`).hasValue('0', 'Minimum input is initially empty.');
    assert.dom(`.maximum label`).hasText('Maximum:', 'Minimum label is correct.');
    assert.dom(`.maximum input`).hasValue('0', 'Maximum input is initially empty.');
    assert.dom(`.academic-level label`).hasText('Academic Level:', 'Academic level label is correct.');
    assert.equal(findAll(`.academic-level option`).length, academicLevels.length, 'Academic level dropdown has the correct number of options.');
    for (let i = 0; i < academicLevels.length; i++) {
      let level = academicLevels[i];
      assert.dom(`.academic-level option:nth-of-type(${i + 1})`).hasText(level.name, 'Academic level option label is correct.');
      assert.dom(`.academic-level option:nth-of-type(${i + 1})`).hasValue(level.id, 'Academic level option value is correct.');
    }
    assert.dom(`.child-sequence-order label`).hasText('Child Sequence Order:', 'Child sequence order label is correct');
    assert.dom(`.child-sequence-order option`).exists({ count: 3 }, 'There are three child sequence order options');
    assert.dom(`.child-sequence-order option:nth-of-type(1)`).hasValue('1', 'Child sequence order option value is correct.');
    assert.dom(`.child-sequence-order option:nth-of-type(1)`).hasText('Ordered', 'Child sequence order option label is correct.');
    assert.dom(`.child-sequence-order option:nth-of-type(2)`).hasValue('2', 'Child sequence order option value is correct.');
    assert.dom(`.child-sequence-order option:nth-of-type(2)`).hasText('Unordered', 'Child sequence order option label is correct.');
    assert.dom(`.child-sequence-order option:nth-of-type(3)`).hasValue('3', 'Child sequence order option value is correct.');
    assert.dom(`.child-sequence-order option:nth-of-type(3)`).hasText('Parallel', 'Child sequence order option label is correct.');
    assert.dom(`.order-in-sequence`).doesNotExist('Order-in-sequence input is not visible for top-level block creation');
    assert.dom('button.done').exists({ count: 1 }, 'Done button is present.');
    assert.dom('button.done').hasText('Done', 'Done button is labeled correctly.');
    assert.dom('button.cancel').exists({ count: 1 }, 'Cancel button is present.');
    assert.dom('button.cancel').hasText('Cancel', 'Cancel button is labeled correctly.');
  });

  test('order-in-sequence options are visible for ordered parent sequence block', async function(assert) {
    assert.expect(24);
    const school = this.server.create('school');

    const program = this.server.create('program', { school });
    const report = this.server.create('curriculum-inventory-report', {
      year: '2016',
      program,
    });
    const parent = this.server.create('curriculum-inventory-sequence-block', {
      childSequenceOrder: 1,
      report
    });
    this.server.createList('curriculum-inventory-sequence-block', 10, {
      report,
      parent
    });

    const reportModel = await run(() => this.owner.lookup('service:store').find('curriculum-inventory-report', report.id));
    const parentModel = await run(() => this.owner.lookup('service:store').find('curriculum-inventory-sequence-block', parent.id));

    this.set('report', reportModel);
    this.set('parentBlock', parentModel);
    await render(hbs`{{new-curriculum-inventory-sequence-block report=report parent=parentBlock}}`);

    assert.dom(`.order-in-sequence label`).hasText('Order in Sequence:', 'Order in sequence label is correct');
    assert.dom(`.order-in-sequence option`).exists({ count: 11 }, 'Correct number of order in sequence options');
    for (let i = 1; i <= 11; i++) {
      assert.dom(`.order-in-sequence option:nth-of-type(${i})`).hasValue(i, 'Order in sequence option value is correct');
      assert.dom(`.order-in-sequence option:nth-of-type(${i})`).hasText(i, 'Order in sequence option label is correct');
    }
  });

  test('selecting course reveals additional course info', async function(assert) {
    assert.expect(4);

    const school = this.server.create('school');
    const clerkshipType = this.server.create('course-clerkship-type');
    const course = this.server.create('course', {
      school,
      year: '2016',
      published: true,
      title: 'my fancy course',
      clerkshipType,
    });
    const program = this.server.create('program', { school });
    const report = this.server.create('curriculum-inventory-report', {
      year: '2016',
      program,
    });

    const reportModel = await run(() => this.owner.lookup('service:store').find('curriculum-inventory-report', report.id));

    this.set('report', reportModel);
    await render(hbs`{{new-curriculum-inventory-sequence-block report=report}}`);
    await fillIn('.course select', course.id);

    let details = find('.course .details').textContent.trim();
    assert.ok(details.includes('Level: ' + course.level));
    assert.ok(details.includes('Start Date: ' + moment(course.startDate).format('YYYY-MM-DD')));
    assert.ok(details.includes('End Date: ' + moment(course.endDate).format('YYYY-MM-DD')));
    assert.ok(details.includes('Clerkship (' + clerkshipType.title + ')'));
  });

  test('save with defaults', async function(assert) {
    assert.expect(17);
    const school = this.server.create('school');
    const academicLevels = this.server.createList('curriculum-inventory-academic-level', 10);
    const program = this.server.create('program', { school });
    const report = this.server.create('curriculum-inventory-report', {
      academicLevels,
      year: '2016',
      program,
    });

    let newTitle = 'new sequence block';
    let newDescription = 'lorem ipsum';
    let newStartDate = moment('2016-01-05');
    let newEndDate = moment('2016-02-12');
    const reportModel = await run(() => this.owner.lookup('service:store').find('curriculum-inventory-report', report.id));

    this.set('report', reportModel);
    this.set('saveBlock', (block) => {
      assert.ok(block, 'Sequence block gets passed to saveBlock action.');
      return resolve();
    });

    await render(hbs`{{new-curriculum-inventory-sequence-block report=report save=(action saveBlock)}}`);
    await fillIn('.title input', newTitle);
    await fillIn('.description textarea', newDescription);
    let interactor = openDatepicker(find('.start-date input'));
    interactor.selectDate(newStartDate.toDate());
    interactor = openDatepicker(find('.end-date input'));
    interactor.selectDate(newEndDate.toDate());
    await click('button.done');

    const blocks = await run(() => this.owner.lookup('service:store').findAll('curriculum-inventory-sequence-block'));
    assert.equal(blocks.length, 1);
    const newBlock = blocks.objectAt(0);
    assert.equal(newBlock.title, newTitle, 'Given title gets passed.');
    assert.equal(newBlock.description, newDescription, 'Given description gets passed.');
    assert.equal(newBlock.belongsTo('parent').id(), null, 'No parent gets passed for new top-level block.');
    assert.equal(newBlock.belongsTo('academicLevel').id(), academicLevels[0].id, 'First academic level gets passed by default.');
    assert.equal(newBlock.required, 1, '"Required" is passed by default.');
    assert.equal(newBlock.track, false, 'FALSE is passed for "Is Track?" by default.');
    assert.equal(newBlock.orderInSequence, 0, 'order in sequence is zero for top-level blocks.');
    assert.equal(newBlock.childSequenceOrder, 1, 'Child sequence order defaults to "ordered".');
    assert.equal(
      moment(newBlock.startDate).format('YYYY-MM-DD'),
      newStartDate.format('YYYY-MM-DD'),
      'Given start date gets passed.'
    );
    assert.equal(
      moment(newBlock.endDate).format('YYYY-MM-DD'),
      newEndDate.format('YYYY-MM-DD'),
      'Given end date gets passed.'
    );
    assert.equal(newBlock.minimum, 0, 'Minimum defaults to zero.');
    assert.equal(newBlock.minimum, 0, 'Maximum defaults to zero');
    assert.equal(newBlock.belongsTo('course').id(), null, 'No course gets selected/passed by default.');
    assert.equal(newBlock.duration, 0, 'Duration defaults to zero');
    assert.equal(newBlock.belongsTo('report').id(), report.id, 'Given report gets passed.');
  });

  test('save with non-defaults', async function(assert) {
    assert.expect(10);
    const school = this.server.create('school');
    const academicLevels = this.server.createList('curriculum-inventory-academic-level', 10);
    const program = this.server.create('program', { school });
    const report = this.server.create('curriculum-inventory-report', {
      academicLevels,
      year: '2016',
      program,
    });
    const course = this.server.create('course', {
      year: '2016',
      published: true,
      school,
    });

    const reportModel = await run(() => this.owner.lookup('service:store').find('curriculum-inventory-report', report.id));
    let minimum = 10;
    let maximum = 12;
    let duration = 6;

    this.set('report', reportModel);
    this.set('saveBlock', (block) => {
      assert.ok(block, 'Sequence block gets passed to saveBlock action.');
      return resolve();
    });

    await render(hbs`{{new-curriculum-inventory-sequence-block report=report save=(action saveBlock)}}`);

    await fillIn('.title input', 'foo bar');
    await fillIn('.description textarea', 'lorem ipsum');
    await fillIn('.duration input', duration);
    await fillIn('.minimum input', minimum);
    await fillIn('.maximum input', maximum);
    await fillIn('.course select', course.id);
    await fillIn('.child-sequence-order select', 2);
    await fillIn('.required select', 3);
    await fillIn('.academic-level select', 2);
    await click('.track .toggle-yesno');
    await click('button.done');

    const blocks = await run(() => this.owner.lookup('service:store').findAll('curriculum-inventory-sequence-block'));
    assert.equal(blocks.length, 1);
    const newBlock = blocks.objectAt(0);
    assert.equal(newBlock.belongsTo('academicLevel').id(), academicLevels[1].id, 'Selected academic level gets passed.');
    assert.equal(newBlock.required, 3, 'Selected "Is required?" value gets passed.');
    assert.equal(newBlock.track, true, 'Selected "Is Track?" value gets passed.');
    assert.equal(newBlock.childSequenceOrder, 2, 'Selected child sequence order gets passed.');
    assert.equal(newBlock.minimum, minimum, 'Given minimum gets passed.');
    assert.equal(newBlock.maximum, maximum, 'Given maximum gets passed.');
    assert.equal(newBlock.belongsTo('course').id(), course.id, 'Selected course gets passed.');
    assert.equal(newBlock.duration, duration, 'Given duration gets passed.');
  });

  test('save nested block in ordered sequence', async function(assert) {
    assert.expect(4);
    const academicLevels = this.server.createList('curriculum-inventory-academic-level', 10);
    const school = this.server.create('school');
    const program = this.server.create('program', { school });
    const report = this.server.create('curriculum-inventory-report', {
      academicLevels,
      year: '2016',
      program,
    });
    const parent = this.server.create('curriculum-inventory-sequence-block', {
      childSequenceOrder: 1,
      report
    });
    this.server.create('curriculum-inventory-sequence-block', {
      report,
      parent
    });

    const reportModel = await run(() => this.owner.lookup('service:store').find('curriculum-inventory-report', report.id));
    const parentModel = await run(() => this.owner.lookup('service:store').find('curriculum-inventory-sequence-block', parent.id));

    this.set('report', reportModel);
    this.set('parentBlock', parentModel);

    this.set('saveBlock', (block) => {
      assert.ok(block, 'Sequence block gets passed to saveBlock action.');
      return resolve();
    });

    await render(
      hbs`{{new-curriculum-inventory-sequence-block report=report parent=parentBlock save=(action saveBlock)}}`
    );
    await fillIn('.title input', 'Foo Bar');
    await fillIn('.description textarea', 'Lorem Ipsum');
    await fillIn('.order-in-sequence select', '2');
    await fillIn('.duration input', '19');
    await click('button.done');

    const blocks = await run(() => this.owner.lookup('service:store').findAll('curriculum-inventory-sequence-block'));
    assert.equal(blocks.length, 3);
    const newBlock = blocks.objectAt(2);
    assert.equal(newBlock.orderInSequence, 2, 'Selected order-in-sequence gets passed.');
    assert.equal(newBlock.belongsTo('parent').id(), parent.id, 'Parent gets passed.');
  });

  test('cancel', async function(assert) {
    assert.expect(1);
    const school = this.server.create('school');
    const program = this.server.create('program', { school });
    const report = this.server.create('curriculum-inventory-report', {
      year: '2016',
      program,
    });

    const reportModel = await run(() => this.owner.lookup('service:store').find('curriculum-inventory-report', report.id));
    this.set('report', reportModel);
    this.set('cancelAction', () => {
      assert.ok(true, 'Cancel action was invoked.');
    });
    await render(hbs`{{new-curriculum-inventory-sequence-block report=report cancel=(action cancelAction)}}`);
    await click('.buttons .cancel');
  });

  test('clear dates', async function(assert) {
    assert.expect(4);
    const newStartDate = moment('2016-01-12');
    const newEndDate = moment('2017-02-22');

    const school = this.server.create('school');
    const program = this.server.create('program', { school });
    const report = this.server.create('curriculum-inventory-report', {
      year: '2016',
      program,
    });

    const reportModel = await run(() => this.owner.lookup('service:store').find('curriculum-inventory-report', report.id));
    this.set('report', reportModel);

    await render(hbs`{{new-curriculum-inventory-sequence-block report=report}}`);
    let startDateInput = find('.start-date input');
    let endDateInput = find('.end-date input');
    let interactor = openDatepicker(startDateInput);
    interactor.selectDate(newStartDate.toDate());
    interactor = openDatepicker(endDateInput);
    interactor.selectDate(newEndDate.toDate());
    assert.equal(newStartDate.format('M/D/YYYY'), startDateInput.value, 'Start date is set');
    assert.equal(newEndDate.format('M/D/YYYY'), endDateInput.value, 'End date is set');
    await click('.clear-dates button');
    assert.equal(startDateInput.value, '', 'Start date input has been cleared.');
    assert.equal(endDateInput.value, '', 'End date input has been cleared.');
  });

  test('save fails when minimum is larger than maximum', async function(assert) {
    assert.expect(2);
    const school = this.server.create('school');
    const program = this.server.create('program', { school });
    const report = this.server.create('curriculum-inventory-report', {
      year: '2016',
      program,
    });

    const reportModel = await run(() => this.owner.lookup('service:store').find('curriculum-inventory-report', report.id));
    this.set('report', reportModel);
    await render(hbs`{{new-curriculum-inventory-sequence-block report=report}}`);

    await fillIn('.title input', 'Foo Bar');
    await fillIn('.description textarea', 'Lorem Ipsum');
    let startDateInput = find('.start-date input');
    let endDateInput = find('.end-date input');
    let interactor = openDatepicker(startDateInput);
    interactor.selectDate(moment('2016-11-12').toDate());
    interactor = openDatepicker(endDateInput);
    interactor.selectDate(moment('2016-12-30').toDate());
    assert.dom('.validation-error-message').doesNotExist('Initially, no validation error is shown.');
    await fillIn('.maximum input', '5');
    await fillIn('.minimum input', '10');
    await click('button.done');
    assert.dom('.validation-error-message').exists({ count: 1 }, 'Validation error shows.');
  });

  test('save fails when minimum is less than zero', async function(assert) {
    assert.expect(2);
    const school = this.server.create('school');
    const program = this.server.create('program', { school });
    const report = this.server.create('curriculum-inventory-report', {
      year: '2016',
      program,
    });

    const reportModel = await run(() => this.owner.lookup('service:store').find('curriculum-inventory-report', report.id));
    this.set('report', reportModel);
    await render(hbs`{{new-curriculum-inventory-sequence-block report=report}}`);
    await fillIn('.title input', 'Foo Bar');
    await fillIn('.description textarea', 'Lorem Ipsum');
    let startDateInput = find('.start-date input');
    let endDateInput = find('.end-date input');
    let interactor = openDatepicker(startDateInput);
    interactor.selectDate(moment('2016-11-12').toDate());
    interactor = openDatepicker(endDateInput);
    interactor.selectDate(moment('2016-12-30').toDate());
    assert.dom('.validation-error-message').doesNotExist('Initially, no validation error is shown.');
    await fillIn('.minimum input', '-1');
    await click('button.done');
    assert.dom('.validation-error-message').exists({ count: 1 }, 'Validation error shows.');
  });

  test('save fails when minimum is empty', async function(assert) {
    assert.expect(2);
    const school = this.server.create('school');
    const program = this.server.create('program', { school });
    const report = this.server.create('curriculum-inventory-report', {
      year: '2016',
      program,
    });

    const reportModel = await run(() => this.owner.lookup('service:store').find('curriculum-inventory-report', report.id));
    this.set('report', reportModel);
    await render(hbs`{{new-curriculum-inventory-sequence-block report=report}}`);
    await fillIn('.title input', 'Foo Bar');
    await fillIn('.description textarea', 'Lorem Ipsum');
    let startDateInput = find('.start-date input');
    let endDateInput = find('.end-date input');
    let interactor = openDatepicker(startDateInput);
    interactor.selectDate(moment('2016-11-12').toDate());
    interactor = openDatepicker(endDateInput);
    interactor.selectDate(moment('2016-12-30').toDate());
    assert.dom('.validation-error-message').doesNotExist('Initially, no validation error is shown.');
    await fillIn('.minimum input', '');
    await click('button.done');
    assert.dom('.validation-error-message').exists({ count: 1 }, 'Validation error shows.');
  });

  test('save fails when maximum is empty', async function(assert) {
    assert.expect(2);
    const school = this.server.create('school');
    const program = this.server.create('program', { school });
    const report = this.server.create('curriculum-inventory-report', {
      year: '2016',
      program,
    });

    const reportModel = await run(() => this.owner.lookup('service:store').find('curriculum-inventory-report', report.id));
    this.set('report', reportModel);
    await render(hbs`{{new-curriculum-inventory-sequence-block report=report}}`);
    await fillIn('.title input', 'Foo Bar');
    await fillIn('.description textarea', 'Lorem Ipsum');
    let startDateInput = find('.start-date input');
    let endDateInput = find('.end-date input');
    let interactor = openDatepicker(startDateInput);
    interactor.selectDate(moment('2016-11-12').toDate());
    interactor = openDatepicker(endDateInput);
    interactor.selectDate(moment('2016-12-30').toDate());
    assert.dom('.validation-error-message').doesNotExist('Initially, no validation error is shown.');
    await fillIn('.maximum input', '-1');
    await click('button.done');
    assert.dom('.validation-error-message').exists({ count: 1 }, 'Validation error shows.');
  });

  test('save with date range and a zero duration', async function(assert) {
    assert.expect(2);
    const school = this.server.create('school');
    const program = this.server.create('program', { school });
    const report = this.server.create('curriculum-inventory-report', {
      year: '2016',
      program,
    });

    const reportModel = await run(() => this.owner.lookup('service:store').find('curriculum-inventory-report', report.id));
    this.set('report', reportModel);

    this.set('saveBlock', () => {
      return resolve();
    });
    await render(hbs`{{new-curriculum-inventory-sequence-block report=report save=(action saveBlock)}}`);
    await fillIn('.title input', 'Foo Bar');
    await fillIn('.description textarea', 'Lorem Ipsum');
    let startDateInput = find('.start-date input');
    let endDateInput = find('.end-date input');
    let interactor = openDatepicker(startDateInput);
    interactor.selectDate(moment('2016-11-12').toDate());
    interactor = openDatepicker(endDateInput);
    interactor.selectDate(moment('2016-12-30').toDate());
    await fillIn('.duration input', '0');
    await click('button.done');

    const blocks = await run(() => this.owner.lookup('service:store').findAll('curriculum-inventory-sequence-block'));
    assert.equal(blocks.length, 1);
    const newBlock = blocks.objectAt(0);
    assert.equal(newBlock.duration, 0, 'correcrt duration.');

  });

  test('save with non-zero duration and no date range', async function(assert) {
    assert.expect(2);
    const school = this.server.create('school');
    const program = this.server.create('program', { school });
    const report = this.server.create('curriculum-inventory-report', {
      year: '2016',
      program,
    });
    const duration = 10;
    const reportModel = await run(() => this.owner.lookup('service:store').find('curriculum-inventory-report', report.id));
    this.set('report', reportModel);
    this.set('saveBlock', () => {
      return resolve();
    });
    await render(hbs`{{new-curriculum-inventory-sequence-block report=report save=(action saveBlock)}}`);
    await fillIn('.title input', 'Foo Bar');
    await fillIn('.description textarea', 'Lorem Ipsum');
    await fillIn('.duration input', duration);
    await click('button.done');

    const blocks = await run(() => this.owner.lookup('service:store').findAll('curriculum-inventory-sequence-block'));
    assert.equal(blocks.length, 1);
    const newBlock = blocks.objectAt(0);
    assert.equal(newBlock.duration, duration, 'correct duration.');
  });

  test('save fails if end-date is older than start-date', async function(assert) {
    assert.expect(2);
    const school = this.server.create('school');
    const program = this.server.create('program', { school });
    const report = this.server.create('curriculum-inventory-report', {
      year: '2016',
      program,
    });

    const reportModel = await run(() => this.owner.lookup('service:store').find('curriculum-inventory-report', report.id));
    this.set('report', reportModel);
    await render(hbs`{{new-curriculum-inventory-sequence-block report=report}}`);
    await fillIn('.title input', 'Foo Bar');
    await fillIn('.description textarea', 'Lorem Ipsum');
    let startDateInput = find('.start-date input');
    let endDateInput = find('.end-date input');
    let interactor = openDatepicker(startDateInput);
    interactor.selectDate(moment('2016-11-12').toDate());
    interactor = openDatepicker(endDateInput);
    interactor.selectDate(moment('2016-12-30').toDate());
    assert.dom('.validation-error-message').doesNotExist('Initially, no validation error is shown.');
    interactor.selectDate(moment('2011-12-30').toDate());
    await click('button.done');
    assert.dom('.validation-error-message').exists({ count: 1 }, 'Validation error shows.');
  });

  test('save fails on missing duration', async function(assert) {
    assert.expect(2);
    const school = this.server.create('school');
    const program = this.server.create('program', { school });
    const report = this.server.create('curriculum-inventory-report', {
      year: '2016',
      program,
    });

    const reportModel = await run(() => this.owner.lookup('service:store').find('curriculum-inventory-report', report.id));
    this.set('report', reportModel);
    await render(hbs`{{new-curriculum-inventory-sequence-block report=report}}`);
    await fillIn('.title input', 'Foo Bar');
    await fillIn('.description textarea', 'Lorem Ipsum');
    let startDateInput = find('.start-date input');
    let endDateInput = find('.end-date input');
    let interactor = openDatepicker(startDateInput);
    interactor.selectDate(moment('2016-11-12').toDate());
    interactor = openDatepicker(endDateInput);
    interactor.selectDate(moment('2016-12-30').toDate());
    assert.dom('.validation-error-message').doesNotExist('Initially, no validation error is shown.');
    await fillIn('.duration input', '');
    await click('button.done');
    assert.dom('.validation-error-message').exists({ count: 1 }, 'Validation error shows.');
  });

  test('save fails on invalid duration', async function(assert) {
    assert.expect(2);
    const school = this.server.create('school');
    const program = this.server.create('program', { school });
    const report = this.server.create('curriculum-inventory-report', {
      year: '2016',
      program,
    });

    const reportModel = await run(() => this.owner.lookup('service:store').find('curriculum-inventory-report', report.id));
    this.set('report', reportModel);
    await render(hbs`{{new-curriculum-inventory-sequence-block report=report}}`);
    await fillIn('.title input', 'Foo Bar');
    await fillIn('.description textarea', 'Lorem Ipsum');
    let startDateInput = find('.start-date input');
    let endDateInput = find('.end-date input');
    let interactor = openDatepicker(startDateInput);
    interactor.selectDate(moment('2016-11-12').toDate());
    interactor = openDatepicker(endDateInput);
    interactor.selectDate(moment('2016-12-30').toDate());
    assert.dom('.validation-error-message').doesNotExist('Initially, no validation error is shown.');
    await fillIn('.duration input', 'WRONG');
    await click('button.done');
    assert.dom('.validation-error-message').exists({ count: 1 }, 'Validation error shows.');
  });

  test('save fails if neither date range nor non-zero duration is provided', async function(assert) {
    assert.expect(1);
    const school = this.server.create('school');
    const program = this.server.create('program', { school });
    const report = this.server.create('curriculum-inventory-report', {
      year: '2016',
      program,
    });

    const reportModel = await run(() => this.owner.lookup('service:store').find('curriculum-inventory-report', report.id));
    this.set('report', reportModel);
    await render(hbs`{{new-curriculum-inventory-sequence-block report=report}}`);
    await fillIn('.title input', 'Foo Bar');
    await fillIn('.description textarea', 'Lorem Ipsum');
    await click('button.done');
    assert.dom('.validation-error-message').exists({ count: 2 }, 'Validation errors show.');
  });

  test('save fails if start-date is given but no end-date is provided', async function(assert) {
    assert.expect(1);
    const school = this.server.create('school');
    const program = this.server.create('program', { school });
    const report = this.server.create('curriculum-inventory-report', {
      year: '2016',
      program,
    });

    const reportModel = await run(() => this.owner.lookup('service:store').find('curriculum-inventory-report', report.id));
    this.set('report', reportModel);
    await render(hbs`{{new-curriculum-inventory-sequence-block report=report}}`);
    await fillIn('.title input', 'Foo Bar');
    await fillIn('.description textarea', 'Lorem Ipsum');
    let startDateInput = find('.start-date input');
    let interactor = openDatepicker(startDateInput);
    interactor.selectDate(moment('2016-11-12').toDate());
    await click('button.done');
    assert.dom('.validation-error-message').exists({ count: 1 }, 'Validation errors show.');
  });
});
