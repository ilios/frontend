import RSVP from 'rsvp';
import EmberObject from '@ember/object';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled, click, findAll, find } from '@ember/test-helpers';
import { module, test } from 'qunit';
import hbs from 'htmlbars-inline-precompile';
import moment from 'moment';


const { resolve } = RSVP;

module('Integration | Component | curriculum inventory sequence block list', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders with top-level sequence blocks', async function(assert) {
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
    await render(
      hbs`{{curriculum-inventory-sequence-block-list report=report sequenceBlocks=(await report.topLevelSequenceBlocks) canUpdate=true remove='removeSequenceBlock'}}`
    );
    return settled().then(() => {
      assert.equal(find('.title').textContent.trim(), `Sequence Blocks (${blocks.length})`,
        'Component title is correct, and show the correct number of blocks.'
      );
      assert.equal(findAll('.actions .expand-button').length, 1, 'Add new button is visible.');

      assert.equal(find('thead th').textContent.trim(), 'Sequence Block', 'Table column header has correct label.');
      assert.equal(find(findAll('thead th')[1]).textContent.trim(), 'Level', 'Table column header has correct label.');
      assert.equal(find(findAll('thead th')[2]).textContent.trim(), 'Sequence #', 'Table column header has correct label.');
      assert.equal(find(findAll('thead th')[3]).textContent.trim(), 'Start Date', 'Table column header has correct label.');
      assert.equal(find(findAll('thead th')[4]).textContent.trim(), 'End Date', 'Table column header has correct label.');
      assert.equal(find(findAll('thead th')[5]).textContent.trim(), 'Course', 'Table column header has correct label.');
      assert.equal(find(findAll('thead th')[6]).textContent.trim(), 'Actions', 'Table column header has correct label.');

      assert.equal(find('tbody tr:eq(0) td').textContent.trim(), block2.get('title'));
      assert.equal(find(findAll('tbody tr:eq(0) td')[1]).textContent.trim(), academicLevel2.get('level'));
      assert.equal(find(findAll('tbody tr:eq(0) td')[2]).textContent.trim(), 'n/a');
      assert.equal(find(findAll('tbody tr:eq(0) td')[3]).textContent.trim(), 'n/a');
      assert.equal(find(findAll('tbody tr:eq(0) td')[4]).textContent.trim(), 'n/a');
      assert.equal(find(findAll('tbody tr:eq(0) td')[5]).textContent.trim(), 'n/a');
      assert.equal(findAll('tbody tr:eq(0) td:eq(6) .edit').length, 1, 'Edit link is visible.');
      assert.equal(findAll('tbody tr:eq(0) td:eq(6) .remove').length, 1, 'Remove link is visible.');

      assert.equal(find('tbody tr:eq(1) td').textContent.trim(), block1.get('title'));
      assert.equal(find(findAll('tbody tr:eq(1) td')[1]).textContent.trim(), academicLevel1.get('level'));
      assert.equal(find(findAll('tbody tr:eq(1) td')[2]).textContent.trim(), 'n/a');
      assert.equal(find(findAll('tbody tr:eq(1) td')[3]).textContent.trim(), moment(block1.get('startDate')).format('L'));
      assert.equal(find(findAll('tbody tr:eq(1) td')[4]).textContent.trim(), moment(block1.get('endDate')).format('L'));
      assert.equal(find(findAll('tbody tr:eq(1) td')[5]).textContent.trim(), course.get('title'));
      assert.equal(findAll('tbody tr:eq(1) td:eq(6) .edit').length, 1, 'Edit link is visible.');
      assert.equal(findAll('tbody tr:eq(1) td:eq(6) .remove').length, 1, 'Remove link is visible.');

    });
  });

  test('it renders with nested blocks', async function(assert) {
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
    await render(
      hbs`{{curriculum-inventory-sequence-block-list parent=parent report=(await parent.report) sequenceBlocks=(await parent.children) canUpdate=true remove='removeSequenceBlock'}}`
    );
    return settled().then(() => {
      assert.equal(find('.title').textContent.trim(), `Sequence Blocks (${nestedBlocks.length})`,
        'Component title is correct, and show the correct number of nested blocks.'
      );
      assert.equal(findAll('.actions .expand-button').length, 1, 'Add new button is visible.');

      assert.equal(find('tbody tr:eq(0) td').textContent.trim(), block1.get('title'));
      assert.equal(find(findAll('tbody tr:eq(0) td')[1]).textContent.trim(), academicLevel1.get('level'));
      assert.equal(find(findAll('tbody tr:eq(0) td')[2]).textContent.trim(), block1.get('orderInSequence'));
      assert.equal(find(findAll('tbody tr:eq(0) td')[3]).textContent.trim(), moment(block1.get('startDate')).format('L'));
      assert.equal(find(findAll('tbody tr:eq(0) td')[4]).textContent.trim(), moment(block1.get('endDate')).format('L'));
      assert.equal(find(findAll('tbody tr:eq(0) td')[5]).textContent.trim(), course.get('title'));
      assert.equal(findAll('tbody tr:eq(0) td:eq(6) .edit').length, 1, 'Edit link is visible.');
      assert.equal(findAll('tbody tr:eq(0) td:eq(6) .remove').length, 1, 'Remove link is visible.');

      assert.equal(find('tbody tr:eq(1) td').textContent.trim(), block2.get('title'));
      assert.equal(find(findAll('tbody tr:eq(1) td')[1]).textContent.trim(), academicLevel2.get('level'));
      assert.equal(find(findAll('tbody tr:eq(1) td')[2]).textContent.trim(), block2.get('orderInSequence'));
      assert.equal(find(findAll('tbody tr:eq(1) td')[3]).textContent.trim(), 'n/a');
      assert.equal(find(findAll('tbody tr:eq(1) td')[4]).textContent.trim(), 'n/a');
      assert.equal(find(findAll('tbody tr:eq(1) td')[5]).textContent.trim(), 'n/a');
      assert.equal(findAll('tbody tr:eq(1) td:eq(6) .edit').length, 1, 'Edit link is visible.');
      assert.equal(findAll('tbody tr:eq(1) td:eq(6) .remove').length, 1, 'Remove link is visible.');

    });
  });

  test('read-only mode', async function(assert) {
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
    await render(
      hbs`{{curriculum-inventory-sequence-block-list report=report sequenceBlocks=(await report.topLevelSequenceBlocks) canUpdate=false remove='removeSequenceBlock'}}`
    );
    return settled().then(() => {
      assert.equal(findAll('.actions .expand-button').length, 0, 'Add new button is not visible.');
      assert.equal(findAll('tbody tr:eq(0) td:eq(6) .edit').length, 1, 'Edit link is visible.');
      assert.equal(findAll('tbody tr:eq(0) td:eq(6) .remove').length, 0, 'Remove link is not visible.');
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
    this.set('removeSequenceBlock', (block) => {
      assert.equal(block, block1, 'Remove action was invoked, and sequence block was passed.');
      report.set('toLevelSequenceBlocks', resolve([ block1 ])); // fake deletion.
    });
    await render(
      hbs`{{curriculum-inventory-sequence-block-list report=report sequenceBlocks=(await report.topLevelSequenceBlocks) canUpdate=true remove=(action removeSequenceBlock)}}`
    );
    await await click('tbody tr:eq(0) td:eq(6) .remove');
    assert.equal(find('tbody tr:eq(1) .confirm-message').textContent.trim().indexOf('Are you sure you want to delete'), 0,
      'Confirmation message is visible.');
    assert.equal(findAll('tbody tr:eq(1) .confirm-buttons .remove').length, 1,'Delete button is visible.');
    assert.equal(findAll('tbody tr:eq(1) .confirm-buttons .done').length, 1,'Cancel button is visible.');
    await await click('tbody tr:eq(1) .confirm-buttons .remove');
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
    await render(
      hbs`{{curriculum-inventory-sequence-block-list report=report  sequenceBlocks=(await report.topLevelSequenceBlocks) canUpdate=true}}`
    );
    await await click('tbody tr:eq(0) td:eq(6) .remove');
    await settled();
    assert.equal(findAll('tbody .confirm-message').length, 1,'Confirmation dialog is visible.');
    await await click('tbody tr:eq(1) .confirm-buttons .done');
    await settled();
    assert.equal(findAll('tbody .confirm-message').length, 0,'Confirmation dialog is not visible after cancelling.');
  });


  test('empty top level blocks list', async function(assert) {
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
    await render(hbs`{{curriculum-inventory-sequence-block-list report=report canUpdate=true}}`);
    return settled().then(() => {
      assert.equal(find('.title').textContent.trim(), `Sequence Blocks (0)`,
        'Component title is correct, and show the correct number of blocks.'
      );
      assert.equal(
        find('.default-message').textContent.trim(), 'There are no sequence blocks in this report.',
        'No blocks message is visible.'
      );
    });
  });

  test('empty nested blocks list', async function(assert) {
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
    await render(
      hbs`{{curriculum-inventory-sequence-block-list parent=parent report=(await parent.report) sequenceBlocks=(await parent.children)}}`
    );
    return settled().then(() => {
      assert.equal(find('.title').textContent.trim(), `Sequence Blocks (0)`,
        'Component title is correct, and show the correct number of blocks.'
      );
      assert.equal(
        find('.default-message').textContent.trim(), 'This sequence block has no nested sequence blocks.',
        'No blocks message is visible.'
      );
    });
  });
});
