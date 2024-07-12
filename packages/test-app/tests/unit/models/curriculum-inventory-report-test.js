import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | CurriculumInventoryReport', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    const model = this.owner.lookup('service:store').createRecord('curriculum-inventory-report');
    assert.ok(!!model);
  });

  test('get top level sequence blocks', async function (assert) {
    const model = this.owner.lookup('service:store').createRecord('curriculum-inventory-report');
    const store = this.owner.lookup('service:store');
    const block1 = store.createRecord('curriculum-inventory-sequence-block', {
      id: 1,
      report: model,
    });
    const block2 = store.createRecord('curriculum-inventory-sequence-block', {
      id: 2,
      report: model,
    });
    const block3 = store.createRecord('curriculum-inventory-sequence-block', {
      id: 3,
      report: model,
      parent: block2,
    });
    (await model.sequenceBlocks).push(block1, block2, block3);
    const blocks = await model.getTopLevelSequenceBlocks();
    assert.strictEqual(blocks.length, 2);
    assert.ok(blocks.includes(block1));
    assert.ok(blocks.includes(block2));
  });

  test('check if report is finalized', function (assert) {
    const store = this.owner.lookup('service:store');
    const model = this.owner.lookup('service:store').createRecord('curriculum-inventory-report');
    assert.notOk(model.belongsTo('export')?.id());
    store.createRecord('curriculum-inventory-export', { id: 1, report: model });
    assert.ok(model.belongsTo('export')?.id());
  });

  test('get linked courses', async function (assert) {
    const model = this.owner.lookup('service:store').createRecord('curriculum-inventory-report');
    const store = this.owner.lookup('service:store');
    const course1 = store.createRecord('course');
    const course2 = store.createRecord('course');
    const course3 = store.createRecord('course');

    const block1 = store.createRecord('curriculum-inventory-sequence-block', {
      course: course1,
      report: model,
    });
    const block2 = store.createRecord('curriculum-inventory-sequence-block', {
      course: course2,
      report: model,
    });
    const block3 = store.createRecord('curriculum-inventory-sequence-block', {
      report: model,
    });
    (await model.sequenceBlocks).push(block1, block2, block3);
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
    const model = this.owner.lookup('service:store').createRecord('curriculum-inventory-report');
    const store = this.owner.lookup('service:store');
    (await model.sequenceBlocks).push(
      store.createRecord('curriculum-inventory-sequence-block', {
        report: model,
      }),
    );
    const linkedCourses = await model.getLinkedCourses();
    assert.notOk(linkedCourses.length);
  });

  test('check if report has linked courses', async function (assert) {
    const model = this.owner.lookup('service:store').createRecord('curriculum-inventory-report');
    const store = this.owner.lookup('service:store');
    const course = store.createRecord('course');
    (await model.sequenceBlocks).push(
      store.createRecord('curriculum-inventory-sequence-block', {
        report: model,
        course,
      }),
    );
    const linkedCourses = await model.getLinkedCourses();
    assert.ok(linkedCourses.length);
  });
});
