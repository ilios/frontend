import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | ProgramYear', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    const model = this.owner.lookup('service:store').createRecord('program-year');
    assert.ok(!!model);
  });

  test('classOf string', async function (assert) {
    assert.expect(3);
    const model = this.owner.lookup('service:store').createRecord('program-year');
    var store = model.store;
    const program = store.createRecord('program', { id: 99, duration: 1 });
    model.set('program', program);
    model.set('startYear', 2000);
    assert.strictEqual(await model.get('classOfYear'), '2001');
    program.set('duration', 5);
    assert.strictEqual(await model.get('classOfYear'), '2005');
    model.set('startYear', 2001);
    assert.strictEqual(await model.get('classOfYear'), '2006');
  });

  test('sortedProgramYearObjectives', async function (assert) {
    assert.expect(4);
    const store = this.owner.lookup('service:store');
    const programYear = store.createRecord('program-year');
    const programYearObjective1 = store.createRecord('program-year-objective', {
      id: 1,
      programYear,
      title: 'Aardvark',
      position: 3,
    });
    const programYearObjective2 = store.createRecord('program-year-objective', {
      id: 2,
      programYear,
      title: 'Bar',
      position: 2,
    });
    const programYearObjective3 = store.createRecord('program-year-objective', {
      id: 3,
      programYear,
      title: 'Foo',
      position: 2,
    });
    const objectives = await programYear.get('sortedProgramYearObjectives');
    assert.strictEqual(objectives.length, 3);
    assert.strictEqual(objectives[0], programYearObjective3);
    assert.strictEqual(objectives[1], programYearObjective2);
    assert.strictEqual(objectives[2], programYearObjective1);
  });
});
