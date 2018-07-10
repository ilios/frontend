import { run } from '@ember/runloop';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | School', function(hooks) {
  setupTest(hooks);

  test('getProgramYearsForYear', async function(assert) {
    let model = run(() => this.owner.lookup('service:store').createRecord('school'));
    let store = this.owner.lookup('service:store');
    await run( async () => {
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
  });
});
