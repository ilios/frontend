import RSVP from 'rsvp';
import EmberObject from '@ember/object';
import { setupRenderingTest } from 'ember-qunit';
import {
  render,
  settled,
  click,
  findAll,
  find
} from '@ember/test-helpers';
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
      assert.dom('.title').hasText(
        `Sequence Blocks (${blocks.length})`,
        'Component title is correct, and show the correct number of blocks.'
      );
      assert.dom('.actions .expand-button').exists({ count: 1 }, 'Add new button is visible.');

      assert.dom('thead th').hasText('Sequence Block', 'Table column header has correct label.');
      assert.dom(findAll('thead th')[1]).hasText('Level', 'Table column header has correct label.');
      assert.dom(findAll('thead th')[2]).hasText('Sequence #', 'Table column header has correct label.');
      assert.dom(findAll('thead th')[3]).hasText('Start Date', 'Table column header has correct label.');
      assert.dom(findAll('thead th')[4]).hasText('End Date', 'Table column header has correct label.');
      assert.dom(findAll('thead th')[5]).hasText('Course', 'Table column header has correct label.');
      assert.dom(findAll('thead th')[6]).hasText('Actions', 'Table column header has correct label.');

      assert.dom('tbody tr:nth-of-type(1) td').hasText(block2.get('title'));
      assert.dom(findAll('tbody tr:nth-of-type(1) td')[1]).hasText(academicLevel2.get('level'));
      assert.dom(findAll('tbody tr:nth-of-type(1) td')[2]).hasText('n/a');
      assert.dom(findAll('tbody tr:nth-of-type(1) td')[3]).hasText('n/a');
      assert.dom(findAll('tbody tr:nth-of-type(1) td')[4]).hasText('n/a');
      assert.dom(findAll('tbody tr:nth-of-type(1) td')[5]).hasText('n/a');
      assert.dom('tbody tr:nth-of-type(1) td:nth-of-type(7) .edit').exists({ count: 1 }, 'Edit link is visible.');
      assert.dom('tbody tr:nth-of-type(1) td:nth-of-type(7) .remove').exists({ count: 1 }, 'Remove link is visible.');

      assert.dom('tbody tr:nth-of-type(2) td').hasText(block1.get('title'));
      assert.dom(findAll('tbody tr:nth-of-type(2) td')[1]).hasText(academicLevel1.get('level'));
      assert.dom(findAll('tbody tr:nth-of-type(2) td')[2]).hasText('n/a');
      assert.dom(findAll('tbody tr:nth-of-type(2) td')[3]).hasText(moment(block1.get('startDate')).format('L'));
      assert.dom(findAll('tbody tr:nth-of-type(2) td')[4]).hasText(moment(block1.get('endDate')).format('L'));
      assert.dom(findAll('tbody tr:nth-of-type(2) td')[5]).hasText(course.get('title'));
      assert.dom('tbody tr:nth-of-type(2) td:nth-of-type(7) .edit').exists({ count: 1 }, 'Edit link is visible.');
      assert.dom('tbody tr:nth-of-type(2) td:nth-of-type(7) .remove').exists({ count: 1 }, 'Remove link is visible.');

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
      assert.dom('.title').hasText(
        `Sequence Blocks (${nestedBlocks.length})`,
        'Component title is correct, and show the correct number of nested blocks.'
      );
      assert.dom('.actions .expand-button').exists({ count: 1 }, 'Add new button is visible.');

      assert.dom('tbody tr:nth-of-type(1) td').hasText(block1.get('title'));
      assert.dom(findAll('tbody tr:nth-of-type(1) td')[1]).hasText(academicLevel1.get('level'));
      assert.dom(findAll('tbody tr:nth-of-type(1) td')[2]).hasText(block1.get('orderInSequence'));
      assert.dom(findAll('tbody tr:nth-of-type(1) td')[3]).hasText(moment(block1.get('startDate')).format('L'));
      assert.dom(findAll('tbody tr:nth-of-type(1) td')[4]).hasText(moment(block1.get('endDate')).format('L'));
      assert.dom(findAll('tbody tr:nth-of-type(1) td')[5]).hasText(course.get('title'));
      assert.dom('tbody tr:nth-of-type(1) td:nth-of-type(7) .edit').exists({ count: 1 }, 'Edit link is visible.');
      assert.dom('tbody tr:nth-of-type(1) td:nth-of-type(7) .remove').exists({ count: 1 }, 'Remove link is visible.');

      assert.dom('tbody tr:nth-of-type(2) td').hasText(block2.get('title'));
      assert.dom(findAll('tbody tr:nth-of-type(2) td')[1]).hasText(academicLevel2.get('level'));
      assert.dom(findAll('tbody tr:nth-of-type(2) td')[2]).hasText(block2.get('orderInSequence'));
      assert.dom(findAll('tbody tr:nth-of-type(2) td')[3]).hasText('n/a');
      assert.dom(findAll('tbody tr:nth-of-type(2) td')[4]).hasText('n/a');
      assert.dom(findAll('tbody tr:nth-of-type(2) td')[5]).hasText('n/a');
      assert.dom('tbody tr:nth-of-type(2) td:nth-of-type(7) .edit').exists({ count: 1 }, 'Edit link is visible.');
      assert.dom('tbody tr:nth-of-type(2) td:nth-of-type(7) .remove').exists({ count: 1 }, 'Remove link is visible.');

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
      assert.dom('.actions .expand-button').doesNotExist('Add new button is not visible.');
      assert.dom('tbody tr:nth-of-type(1) td:nth-of-type(7) .edit').exists({ count: 1 }, 'Edit link is visible.');
      assert.dom('tbody tr:nth-of-type(1) td:nth-of-type(7) .remove').doesNotExist('Remove link is not visible.');
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
    await click('tbody tr:nth-of-type(1) td:nth-of-type(7) .remove');
    assert.equal(find('tbody tr:nth-of-type(2) .confirm-message').textContent.trim().indexOf('Are you sure you want to delete'), 0,
      'Confirmation message is visible.');
    assert.dom('tbody tr:nth-of-type(2) .confirm-buttons .remove').exists({ count: 1 }, 'Delete button is visible.');
    assert.dom('tbody tr:nth-of-type(2) .confirm-buttons .done').exists({ count: 1 }, 'Cancel button is visible.');
    await click('tbody tr:nth-of-type(2) .confirm-buttons .remove');
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
    await click('tbody tr:nth-of-type(1) td:nth-of-type(7) .remove');
    await settled();
    assert.dom('tbody .confirm-message').exists({ count: 1 }, 'Confirmation dialog is visible.');
    await click('tbody tr:nth-of-type(2) .confirm-buttons .done');
    await settled();
    assert.dom('tbody .confirm-message').doesNotExist('Confirmation dialog is not visible after cancelling.');
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
      assert.dom('.title').hasText(
        `Sequence Blocks (0)`,
        'Component title is correct, and show the correct number of blocks.'
      );
      assert.dom('.default-message').hasText(
        'There are no sequence blocks in this report.',
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
      assert.dom('.title').hasText(
        `Sequence Blocks (0)`,
        'Component title is correct, and show the correct number of blocks.'
      );
      assert.dom('.default-message').hasText(
        'This sequence block has no nested sequence blocks.',
        'No blocks message is visible.'
      );
    });
  });
});
