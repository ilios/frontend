import { getOwner } from '@ember/application';
import RSVP from 'rsvp';
import EmberObject from '@ember/object';
import { moduleForComponent } from 'ember-qunit';
import { test } from 'qunit';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';
import moment from 'moment';
import initializer from "ilios/instance-initializers/load-common-translations";

const { resolve } = RSVP;

moduleForComponent('curriculum-inventory-sequence-block-list', 'Integration | Component | curriculum inventory sequence block list', {
  integration: true,
  setup(){
    initializer.initialize(getOwner(this));
  },
});

test('it renders with top-level sequence blocks', function(assert) {
  assert.expect(25);

  let school = EmberObject.create({ id() { return 1; }});

  let program = EmberObject.create({
    belongsTo() {
      return school;
    }
  });

  let course = EmberObject.create({
    id: 1,
    title: "Life Lessons",
  });

  let academicLevel1 = EmberObject.create({ id: 1, level: '2'});
  let academicLevel2 = EmberObject.create({ id: 2, level: '1'});

  let block1 = EmberObject.create({
    id: 1,
    academicLevel: resolve(academicLevel1),
    title: 'Foo',
    startDate: new Date('2015-02-23'),
    endDate: new Date('2016-12-03'),
    course: resolve(course),
    orderInSequence: 0,
  });

  let block2 = EmberObject.create({
    id: 2,
    academicLevel: resolve(academicLevel2),
    title: 'Bar',
    startDate: null,
    endDate: null,
    course: resolve(null),
    orderInSequence: 0,
  });

  let blocks = [block1, block2];

  let report = EmberObject.create({
    academicLevels: resolve([]),
    year: '2016',
    program: resolve(program),
    linkedCourses: resolve([]),
    isFinalized: false,
    name: 'Lorem Ipsum',
    startDate: moment('2015-06-12').toDate(),
    endDate: moment('2016-04-11').toDate(),
    description: 'Lorem Ipsum',
    topLevelSequenceBlocks: resolve(blocks)
  });

  this.set('report', report);
  this.set('removeSequenceBlock', function() {});
  this.render(hbs`{{curriculum-inventory-sequence-block-list report=report canUpdate=true remove='removeSequenceBlock'}}`);
  return wait().then(() => {
    assert.equal(this.$('.title').text().trim(), `Sequence Blocks (${blocks.length})`,
      'Component title is correct, and show the correct number of blocks.'
    );
    assert.equal(this.$('.actions .expand-button').length, 1, 'Add new button is visible.');

    assert.equal(this.$('thead th:eq(0)').text().trim(), 'Sequence Block', 'Table column header has correct label.');
    assert.equal(this.$('thead th:eq(1)').text().trim(), 'Level', 'Table column header has correct label.');
    assert.equal(this.$('thead th:eq(2)').text().trim(), 'Sequence #', 'Table column header has correct label.');
    assert.equal(this.$('thead th:eq(3)').text().trim(), 'Start Date', 'Table column header has correct label.');
    assert.equal(this.$('thead th:eq(4)').text().trim(), 'End Date', 'Table column header has correct label.');
    assert.equal(this.$('thead th:eq(5)').text().trim(), 'Course', 'Table column header has correct label.');
    assert.equal(this.$('thead th:eq(6)').text().trim(), 'Actions', 'Table column header has correct label.');

    assert.equal(this.$('tbody tr:eq(0) td:eq(0)').text().trim(), block2.get('title'));
    assert.equal(this.$('tbody tr:eq(0) td:eq(1)').text().trim(), academicLevel2.get('level'));
    assert.equal(this.$('tbody tr:eq(0) td:eq(2)').text().trim(), 'n/a');
    assert.equal(this.$('tbody tr:eq(0) td:eq(3)').text().trim(), 'n/a');
    assert.equal(this.$('tbody tr:eq(0) td:eq(4)').text().trim(), 'n/a');
    assert.equal(this.$('tbody tr:eq(0) td:eq(5)').text().trim(), 'n/a');
    assert.equal(this.$('tbody tr:eq(0) td:eq(6) .edit').length, 1, 'Edit link is visible.');
    assert.equal(this.$('tbody tr:eq(0) td:eq(6) .remove').length, 1, 'Remove link is visible.');

    assert.equal(this.$('tbody tr:eq(1) td:eq(0)').text().trim(), block1.get('title'));
    assert.equal(this.$('tbody tr:eq(1) td:eq(1)').text().trim(), academicLevel1.get('level'));
    assert.equal(this.$('tbody tr:eq(1) td:eq(2)').text().trim(), 'n/a');
    assert.equal(this.$('tbody tr:eq(1) td:eq(3)').text().trim(), moment(block1.get('startDate')).format('L'));
    assert.equal(this.$('tbody tr:eq(1) td:eq(4)').text().trim(), moment(block1.get('endDate')).format('L'));
    assert.equal(this.$('tbody tr:eq(1) td:eq(5)').text().trim(), course.get('title'));
    assert.equal(this.$('tbody tr:eq(1) td:eq(6) .edit').length, 1, 'Edit link is visible.');
    assert.equal(this.$('tbody tr:eq(1) td:eq(6) .remove').length, 1, 'Remove link is visible.');

  });
});

test('it renders with nested blocks', function(assert) {
  assert.expect(18);

  let school = EmberObject.create({ id() { return 1; }});

  let program = EmberObject.create({
    belongsTo() {
      return school;
    }
  });

  let course = EmberObject.create({
    id: 1,
    title: "Life Lessons",
  });

  let academicLevel1 = EmberObject.create({ id: 1, level: '2'});
  let academicLevel2 = EmberObject.create({ id: 2, level: '1'});


  let block1 = EmberObject.create({
    id: 2,
    academicLevel: resolve(academicLevel1),
    title: 'Foo',
    startDate: new Date('2015-02-23'),
    endDate: new Date('2016-12-03'),
    course: resolve(course),
    orderInSequence: 1,
  });

  let block2 = EmberObject.create({
    id: 3,
    academicLevel: resolve(academicLevel2),
    title: 'Bar',
    startDate: null,
    endDate: null,
    course: resolve(null),
    orderInSequence: 2,
  });

  let nestedBlocks = [block1, block2];

  let parentBlock = EmberObject.create({
    id: 1,
    academicLevel: resolve(academicLevel1),
    title: 'Parent Block',
    course: resolve(null),
    isOrdered: true,
    children: resolve(nestedBlocks),
  });

  let report = EmberObject.create({
    academicLevels: resolve([]),
    year: '2016',
    program: resolve(program),
    linkedCourses: resolve([]),
    isFinalized: false,
    name: 'Lorem Ipsum',
    startDate: moment('2015-06-12').toDate(),
    endDate: moment('2016-04-11').toDate(),
    description: 'Lorem Ipsum',
    topLevelSequenceBlocks: resolve([parentBlock]),
    sequenceBlocks: resolve([parentBlock, block1, block2])
  });

  parentBlock.set('report', resolve(report));
  block1.set('report', resolve(report));
  block1.set('parent', resolve(parentBlock));
  block2.set('report', resolve(report));
  block2.set('parent', resolve(parentBlock));

  this.set('parent', parentBlock);
  this.set('removeSequenceBlock', function() {});
  this.render(hbs`{{curriculum-inventory-sequence-block-list parent=parent canUpdate=true remove='removeSequenceBlock'}}`);
  return wait().then(() => {
    assert.equal(this.$('.title').text().trim(), `Sequence Blocks (${nestedBlocks.length})`,
      'Component title is correct, and show the correct number of nested blocks.'
    );
    assert.equal(this.$('.actions .expand-button').length, 1, 'Add new button is visible.');

    assert.equal(this.$('tbody tr:eq(0) td:eq(0)').text().trim(), block1.get('title'));
    assert.equal(this.$('tbody tr:eq(0) td:eq(1)').text().trim(), academicLevel1.get('level'));
    assert.equal(this.$('tbody tr:eq(0) td:eq(2)').text().trim(), block1.get('orderInSequence'));
    assert.equal(this.$('tbody tr:eq(0) td:eq(3)').text().trim(), moment(block1.get('startDate')).format('L'));
    assert.equal(this.$('tbody tr:eq(0) td:eq(4)').text().trim(), moment(block1.get('endDate')).format('L'));
    assert.equal(this.$('tbody tr:eq(0) td:eq(5)').text().trim(), course.get('title'));
    assert.equal(this.$('tbody tr:eq(0) td:eq(6) .edit').length, 1, 'Edit link is visible.');
    assert.equal(this.$('tbody tr:eq(0) td:eq(6) .remove').length, 1, 'Remove link is visible.');

    assert.equal(this.$('tbody tr:eq(1) td:eq(0)').text().trim(), block2.get('title'));
    assert.equal(this.$('tbody tr:eq(1) td:eq(1)').text().trim(), academicLevel2.get('level'));
    assert.equal(this.$('tbody tr:eq(1) td:eq(2)').text().trim(), block2.get('orderInSequence'));
    assert.equal(this.$('tbody tr:eq(1) td:eq(3)').text().trim(), 'n/a');
    assert.equal(this.$('tbody tr:eq(1) td:eq(4)').text().trim(), 'n/a');
    assert.equal(this.$('tbody tr:eq(1) td:eq(5)').text().trim(), 'n/a');
    assert.equal(this.$('tbody tr:eq(1) td:eq(6) .edit').length, 1, 'Edit link is visible.');
    assert.equal(this.$('tbody tr:eq(1) td:eq(6) .remove').length, 1, 'Remove link is visible.');

  });
});

test('read-only mode', function(assert){
  assert.expect(3);

  let school = EmberObject.create({ id() { return 1; }});

  let program = EmberObject.create({
    belongsTo() {
      return school;
    }
  });

  let block1 = EmberObject.create({
    id: 1,
    academicLevel: resolve(EmberObject.create({ id: 1, level: '2'})),
    title: 'Bar',
    startDate: new Date('2015-02-23'),
    endDate: new Date('2016-12-03'),
    course: resolve(null),
    orderInSequence: 0,
  });
  let report = EmberObject.create({
    academicLevels: resolve([]),
    year: '2016',
    program: resolve(program),
    linkedCourses: resolve([]),
    name: 'Lorem Ipsum',
    startDate: moment('2015-06-12').toDate(),
    endDate: moment('2016-04-11').toDate(),
    description: 'Lorem Ipsum',
    topLevelSequenceBlocks: resolve([ block1 ])
  });

  this.set('report', report);
  this.set('removeSequenceBlock', function() {});
  this.render(hbs`{{curriculum-inventory-sequence-block-list report=report canUpdate=false remove='removeSequenceBlock'}}`);
  return wait().then(() => {
    assert.equal(this.$('.actions .expand-button').length, 0, 'Add new button is not visible.');
    assert.equal(this.$('tbody tr:eq(0) td:eq(6) .edit').length, 1, 'Edit link is visible.');
    assert.equal(this.$('tbody tr:eq(0) td:eq(6) .remove').length, 0, 'Remove link is not visible.');
  });
});

test('delete', async function(assert){
  assert.expect(4);

  let school = EmberObject.create({ id() { return 1; }});

  let program = EmberObject.create({
    belongsTo() {
      return school;
    }
  });

  let block1 = EmberObject.create({
    id: 1,
    academicLevel: resolve(EmberObject.create({ id: 1, level: '2'})),
    title: 'Foo',
    startDate: new Date('2015-02-23'),
    endDate: new Date('2016-12-03'),
    course: resolve(null),
    orderInSequence: 0,
  });

  let report = EmberObject.create({
    academicLevels: resolve([]),
    year: '2016',
    program: resolve(program),
    linkedCourses: resolve([]),
    isFinalized: false,
    name: 'Lorem Ipsum',
    startDate: moment('2015-06-12').toDate(),
    endDate: moment('2016-04-11').toDate(),
    description: 'Lorem Ipsum',
    topLevelSequenceBlocks: resolve([ block1 ])
  });

  this.set('report', report);
  this.on('removeSequenceBlock', function(block) {
    assert.equal(block, block1, 'Remove action was invoked, and sequence block was passed.');
    report.set('toLevelSequenceBlocks', resolve([ block1 ])); // fake deletion.
  });
  this.render(hbs`{{curriculum-inventory-sequence-block-list report=report canUpdate=true remove='removeSequenceBlock'}}`);
  await this.$('tbody tr:eq(0) td:eq(6) .remove').click();
  assert.equal(this.$('tbody tr:eq(1) .confirm-message').text().trim().indexOf('Are you sure you want to delete'), 0,
    'Confirmation message is visible.');
  assert.equal(this.$('tbody tr:eq(1) .confirm-buttons .remove').length, 1,'Delete button is visible.');
  assert.equal(this.$('tbody tr:eq(1) .confirm-buttons .done').length, 1,'Cancel button is visible.');
  await this.$('tbody tr:eq(1) .confirm-buttons .remove').click();
});

test('cancel delete', async function(assert){
  assert.expect(2);

  let school = EmberObject.create({ id() { return 1; }});

  let program = EmberObject.create({
    belongsTo() {
      return school;
    }
  });

  let block1 = EmberObject.create({
    id: 1,
    academicLevel: resolve(EmberObject.create({ id: 1, level: '2'})),
    title: 'Foo',
    startDate: new Date('2015-02-23'),
    endDate: new Date('2016-12-03'),
    course: resolve(null),
    orderInSequence: 0,
  });

  let report = EmberObject.create({
    academicLevels: resolve([]),
    year: '2016',
    program: resolve(program),
    linkedCourses: resolve([]),
    isFinalized: false,
    name: 'Lorem Ipsum',
    startDate: moment('2015-06-12').toDate(),
    endDate: moment('2016-04-11').toDate(),
    description: 'Lorem Ipsum',
    topLevelSequenceBlocks: resolve([ block1 ])
  });

  this.set('report', report);
  this.render(hbs`{{curriculum-inventory-sequence-block-list report=report canUpdate=true}}`);
  await this.$('tbody tr:eq(0) td:eq(6) .remove').click();
  await wait();
  assert.equal(this.$('tbody .confirm-message').length, 1,'Confirmation dialog is visible.');
  await this.$('tbody tr:eq(1) .confirm-buttons .done').click();
  await wait();
  assert.equal(this.$('tbody .confirm-message').length, 0,'Confirmation dialog is not visible after cancelling.');
});


test('empty top level blocks list', function(assert) {
  assert.expect(2);

  let school = EmberObject.create({ id() { return 1; }});

  let program = EmberObject.create({
    belongsTo() {
      return school;
    }
  });

  let report = EmberObject.create({
    academicLevels: resolve([]),
    year: '2016',
    program: resolve(program),
    linkedCourses: resolve([]),
    isFinalized: false,
    name: 'Lorem Ipsum',
    startDate: moment('2015-06-12').toDate(),
    endDate: moment('2016-04-11').toDate(),
    description: 'Lorem Ipsum',
    topLevelSequenceBlocks: resolve([])
  });

  this.set('report', report);
  this.render(hbs`{{curriculum-inventory-sequence-block-list report=report canUpdate=true}}`);
  return wait().then(() => {
    assert.equal(this.$('.title').text().trim(), `Sequence Blocks (0)`,
      'Component title is correct, and show the correct number of blocks.'
    );
    assert.equal(
      this.$('.default-message').text().trim(), 'There are no sequence blocks in this report.',
      'No blocks message is visible.'
    );
  });
});

test('empty nested blocks list', function(assert) {
  assert.expect(2);

  let school = EmberObject.create({ id() { return 1; }});

  let program = EmberObject.create({
    belongsTo() {
      return school;
    }
  });

  let parentBlock = EmberObject.create({
    id: 1,
    academicLevel: resolve(EmberObject.create({ id: 1, level: '2'})),
    title: 'Parent Block',
    course: resolve(null),
    isOrdered: true,
    children: resolve([]),
  });

  let report = EmberObject.create({
    academicLevels: resolve([]),
    year: '2016',
    program: resolve(program),
    linkedCourses: resolve([]),
    isFinalized: false,
    name: 'Lorem Ipsum',
    startDate: moment('2015-06-12').toDate(),
    endDate: moment('2016-04-11').toDate(),
    description: 'Lorem Ipsum',
    topLevelSequenceBlocks: resolve([parentBlock]),
    sequenceBlocks: resolve([parentBlock])
  });

  parentBlock.set('report', resolve(report));

  this.set('parent', parentBlock);
  this.render(hbs`{{curriculum-inventory-sequence-block-list parent=parent}}`);
  return wait().then(() => {
    assert.equal(this.$('.title').text().trim(), `Sequence Blocks (0)`,
      'Component title is correct, and show the correct number of blocks.'
    );
    assert.equal(
      this.$('.default-message').text().trim(), 'This sequence block has no nested sequence blocks.',
      'No blocks message is visible.'
    );
  });
});
