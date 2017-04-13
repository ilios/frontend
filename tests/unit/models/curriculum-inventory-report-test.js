import { moduleForModel, test } from 'ember-qunit';
import Ember from 'ember';
import modelList from '../../helpers/model-list';

const { run } = Ember;

moduleForModel('curriculum-inventory-report', 'Unit | Model | CurriculumInventoryReport', {
  needs: modelList
});

test('it exists', function(assert) {
  let model = this.subject();
  assert.ok(!!model);
});

test('get top level sequence blocks', function(assert){
  assert.expect(3);
  let model = this.subject();
  let store = this.store();
  Ember.run(() => {
    let block1 = store.createRecord('curriculumInventorySequenceBlock', {
      'id': 1,
      'report': model,
    });
    let block2 = store.createRecord('curriculumInventorySequenceBlock', {
      'id': 2,
      'report': model
    });
    let block3 = store.createRecord('curriculumInventorySequenceBlock', {
      'id': 3,
      'report': model,
      'parent': block2
    });
    model.get('sequenceBlocks').pushObjects([ block1, block2, block3 ]);
    model.get('topLevelSequenceBlocks').then(blocks => {
      assert.equal(blocks.length, 2);
      assert.ok(blocks.includes(block1));
      assert.ok(blocks.includes(block2));
    });
  });
});

test('check if report is finalized', function(assert){
  let model = this.subject();
  let store = this.store();
  Ember.run(() => {
    assert.notOk(model.get('isFinalized'));
    const reportExport = store.createRecord('curriculumInventoryExport', { id: 1 });
    model.set('export', reportExport);
    assert.ok(model.get('isFinalized'));
  });
});

test('get label for academic year', function(assert){
  let model = this.subject();
  Ember.run(() => {
    model.set('year', 1346);
    assert.equal(model.get('yearLabel'), '1346 - 1347');
  });
});

test('get linked courses', function(assert) {
  assert.expect(3);
  let model = this.subject();
  let store = this.store();
  Ember.run(() => {
    let course1 = store.createRecord('course');
    let course2 = store.createRecord('course');
    let course3 = store.createRecord('course');

    let block1 = store.createRecord('curriculumInventorySequenceBlock', {
      'course': course1,
      'report': model
    });
    let block2 = store.createRecord('curriculumInventorySequenceBlock', {
      'course': course2,
      'report': model
    });
    let block3 = store.createRecord('curriculumInventorySequenceBlock', {
      'report': model
    });
    model.get('sequenceBlocks').pushObjects([ block1, block2, block3 ]);
    model.get('linkedCourses').then(linkedCourses => {
      assert.ok(linkedCourses.includes(course1));
      assert.ok(linkedCourses.includes(course2));
      assert.notOk(linkedCourses.includes(course3));
    });
  });
});

test('no linked courses', async function(assert){
  assert.expect(1);
  let model = this.subject();
  run( async () => {
    let hasLinkedCourses = await model.get('hasLinkedCourses');
    assert.notOk(hasLinkedCourses);
  });
});

test('linked blocks are not linked courses', async function(assert){
  assert.expect(1);
  let model = this.subject();
  let store = this.store();
  run( async () => {
    model.get('sequenceBlocks').pushObject(
      store.createRecord('curriculumInventorySequenceBlock', {
        'report': model
      })
    );
    let hasLinkedCourses = await model.get('hasLinkedCourses');
    assert.notOk(hasLinkedCourses);
  });
});

test('check if report has linked courses', async function(assert){
  assert.expect(1);
  let model = this.subject();
  let store = this.store();
  run( async () => {
    let course = store.createRecord('course');
    model.get('sequenceBlocks').pushObject(
      store.createRecord('curriculumInventorySequenceBlock', {
        'report': model,
        course
      })
    );
    let hasLinkedCourses = await model.get('hasLinkedCourses');
    assert.ok(hasLinkedCourses);
  });
});
