import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | CurriculumInventoryReport', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    this.store = this.owner.lookup('service:store');
  });

  test('it exists', function (assert) {
    const model = this.store.createRecord('curriculum-inventory-report');
    assert.ok(!!model);
  });

  test('get top level sequence blocks', async function (assert) {
    const model = this.store.createRecord('curriculum-inventory-report');
    const block1 = this.store.createRecord('curriculum-inventory-sequence-block', {
      id: '1',
      report: model,
    });
    const block2 = this.store.createRecord('curriculum-inventory-sequence-block', {
      id: '2',
      report: model,
    });
    const block3 = this.store.createRecord('curriculum-inventory-sequence-block', {
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
    const model = this.store.createRecord('curriculum-inventory-report');
    assert.notOk(model.belongsTo('export')?.id());
    this.store.createRecord('curriculum-inventory-export', { id: '1', report: model });
    assert.ok(model.belongsTo('export')?.id());
  });

  test('get linked courses', async function (assert) {
    const model = this.store.createRecord('curriculum-inventory-report');
    const course1 = this.store.createRecord('course');
    const course2 = this.store.createRecord('course');
    const course3 = this.store.createRecord('course');

    this.store.createRecord('curriculum-inventory-sequence-block', {
      course: course1,
      report: model,
    });
    this.store.createRecord('curriculum-inventory-sequence-block', {
      course: course2,
      report: model,
    });
    this.store.createRecord('curriculum-inventory-sequence-block', {
      report: model,
    });
    const linkedCourses = await model.getLinkedCourses();
    assert.ok(linkedCourses.includes(course1));
    assert.ok(linkedCourses.includes(course2));
    assert.notOk(linkedCourses.includes(course3));
  });

  test('no linked courses', async function (assert) {
    const model = this.store.createRecord('curriculum-inventory-report');
    const linkedCourses = await model.getLinkedCourses();
    assert.notOk(linkedCourses.length);
  });

  test('linked blocks are not linked courses', async function (assert) {
    const model = this.store.createRecord('curriculum-inventory-report');
    this.store.createRecord('curriculum-inventory-sequence-block', {
      report: model,
    });
    const linkedCourses = await model.getLinkedCourses();
    assert.notOk(linkedCourses.length);
  });

  test('check if report has linked courses', async function (assert) {
    const model = this.store.createRecord('curriculum-inventory-report');
    const course = this.store.createRecord('course');
    this.store.createRecord('curriculum-inventory-sequence-block', {
      report: model,
      course,
    });
    const linkedCourses = await model.getLinkedCourses();
    assert.ok(linkedCourses.length);
  });
});
