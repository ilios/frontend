import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | CurriculumInventoryReport', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    const model = this.owner.lookup('service:store').createRecord('curriculum-inventory-report');
    assert.ok(!!model);
  });

  test('get top level sequence blocks', async function (assert) {
    const store = this.owner.lookup('service:store');
    const model = store.createRecord('curriculum-inventory-report');
    const block1 = store.createRecord('curriculum-inventory-sequence-block', {
      id: '1',
      report: model,
    });
    const block2 = store.createRecord('curriculum-inventory-sequence-block', {
      id: '2',
      report: model,
    });
    const block3 = store.createRecord('curriculum-inventory-sequence-block', {
      id: '3',
      report: model,
      parent: block2,
    });
    const topLevelBlocks = await model.getTopLevelSequenceBlocks();
    assert.strictEqual(topLevelBlocks.length, 2);
    assert.ok(topLevelBlocks.includes(block1));
    assert.ok(topLevelBlocks.includes(block2));
    assert.notOk(topLevelBlocks.includes(block3));
  });

  test('check if report is finalized', function (assert) {
    const store = this.owner.lookup('service:store');
    const model = store.createRecord('curriculum-inventory-report');
    assert.notOk(model.belongsTo('export')?.id());
    store.createRecord('curriculum-inventory-export', { id: '1', report: model });
    assert.ok(model.belongsTo('export')?.id());
  });

  test('get linked courses', async function (assert) {
    const store = this.owner.lookup('service:store');
    const model = store.createRecord('curriculum-inventory-report');
    const course1 = store.createRecord('course');
    const course2 = store.createRecord('course');
    const course3 = store.createRecord('course');

    store.createRecord('curriculum-inventory-sequence-block', {
      course: course1,
      report: model,
    });
    store.createRecord('curriculum-inventory-sequence-block', {
      course: course2,
      report: model,
    });
    store.createRecord('curriculum-inventory-sequence-block', {
      report: model,
    });
    const linkedCourses = await model.getLinkedCourses();
    assert.ok(linkedCourses.includes(course1));
    assert.ok(linkedCourses.includes(course2));
    assert.notOk(linkedCourses.includes(course3));
  });

  test('no linked courses', async function (assert) {
    const model = this.owner.lookup('service:store').createRecord('curriculum-inventory-report');
    const linkedCourses = await model.getLinkedCourses();
    assert.notOk(linkedCourses.length);
  });

  test('linked blocks are not linked courses', async function (assert) {
    const store = this.owner.lookup('service:store');
    const model = store.createRecord('curriculum-inventory-report');
    store.createRecord('curriculum-inventory-sequence-block', {
      report: model,
    });
    const linkedCourses = await model.getLinkedCourses();
    assert.notOk(linkedCourses.length);
  });

  test('check if report has linked courses', async function (assert) {
    const store = this.owner.lookup('service:store');
    const model = store.createRecord('curriculum-inventory-report');
    const course = store.createRecord('course');
    store.createRecord('curriculum-inventory-sequence-block', {
      report: model,
      course,
    });
    const linkedCourses = await model.getLinkedCourses();
    assert.ok(linkedCourses.length);
  });
});
