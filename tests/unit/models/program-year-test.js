import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | ProgramYear', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    const model = this.owner.lookup('service:store').createRecord('program-year');
    assert.ok(!!model);
  });

  test('academic year string', function(assert) {
    const model = this.owner.lookup('service:store').createRecord('program-year');
    model.set('startYear', 2000);
    assert.equal(model.get('academicYear'), '2000 - 2001');
  });

  test('classOf string', async function(assert) {
    assert.expect(3);
    const model = this.owner.lookup('service:store').createRecord('program-year');
    var store = model.store;
    const program = store.createRecord('program', {id:99, duration:1});
    model.set('program', program);
    model.set('startYear', 2000);
    assert.equal(await model.get('classOfYear'), '2001');
    program.set('duration', 5);
    assert.equal(await model.get('classOfYear'), '2005');
    model.set('startYear', 2001);
    assert.equal(await model.get('classOfYear'), '2006');
  });

  test('sortedObjectives', async function(assert) {
    assert.expect(4);
    const store = this.owner.lookup('service:store');
    const programYear = store.createRecord('program-year');
    const objective1 = store.createRecord('objective', { title: 'Aardvark'});
    const objective2 = store.createRecord('objective', { title: 'Bar' });
    const objective3 = store.createRecord('objective', { title: 'Foo' });
    store.createRecord('program-year-objective', { id: 1, programYear, objective: objective1, position: 3 });
    store.createRecord('program-year-objective', { id: 2, programYear, objective: objective2, position: 2 });
    store.createRecord('program-year-objective', { id: 3, programYear, objective: objective3, position: 2 });
    const objectives = await programYear.get('sortedObjectives');
    assert.equal(objectives.length, 3);
    assert.equal(objectives[0], objective3);
    assert.equal(objectives[1], objective2);
    assert.equal(objectives[2], objective1);
  });
});
