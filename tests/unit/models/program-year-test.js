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
});
