import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | School', function(hooks) {
  setupTest(hooks);

  test('getProgramYearsForYear', async function(assert) {
    let model = this.owner.lookup('service:store').createRecord('school');
    let store = this.owner.lookup('service:store');
    const program1 = store.createRecord('program');
    const program2 = store.createRecord('program');
    store.createRecord('programYear', { program: program1, startYear: 2014 });
    const programYear1 = store.createRecord('programYear', { program: program1, startYear: 2017 });
    const programYear2 = store.createRecord('programYear', { program: program2, startYear: 2017 });
    model.get('programs').pushObjects([ program1, program2 ]);

    const programYears = await model.getProgramYearsForYear(2017);

    assert.equal(programYears.length, 2);
    assert.ok(programYears.includes(programYear1));
    assert.ok(programYears.includes(programYear2));
  });

  test('getConfigValue booleans', async function(assert) {
    let store = this.owner.lookup('service:store');
    let school = store.createRecord('school');
    store.createRecord('school-config', {
      name: 'test-false',
      value: 'false',
      school,
    });
    const testFalse = await school.getConfigValue('test-false');
    assert.deepEqual(testFalse, false);
    store.createRecord('school-config', {
      name: 'test-true',
      value: 'true',
      school,
    });
    const testTrue = await school.getConfigValue('test-true');
    assert.deepEqual(testTrue, true);
  });
});
