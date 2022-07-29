import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Unit | Model | School', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function () {
    this.store = this.owner.lookup('service:store');
  });

  test('getConfigValue booleans', async function (assert) {
    const school = this.store.createRecord('school');
    this.store.createRecord('school-config', {
      name: 'test-false',
      value: 'false',
      school,
    });
    const testFalse = await school.getConfigValue('test-false');
    assert.false(testFalse);
    this.store.createRecord('school-config', {
      name: 'test-true',
      value: 'true',
      school,
    });
    const testTrue = await school.getConfigValue('test-true');
    assert.true(testTrue);
  });

  test('getConfigValue empty', async function (assert) {
    const school = this.store.createRecord('school');
    const testNull = await school.getConfigValue('test-false');
    assert.deepEqual(testNull, null);
  });

  test('getConfigValue null', async function (assert) {
    const school = this.store.createRecord('school');
    this.store.createRecord('school-config', {
      name: 'test-null',
      value: 'null',
      school,
    });
    const testNull = await school.getConfigValue('test-null');
    assert.deepEqual(testNull, null);
  });

  test('cohorts', async function (assert) {
    assert.ok(true);
    const school = this.server.create('school');
    const model = await this.store.findRecord('school', school.id);
    let cohorts = await model.cohorts;
    assert.strictEqual(cohorts.length, 0);
    const program1 = this.server.create('program', {
      school,
    });
    const program2 = this.server.create('program', {
      school,
    });
    const programYear1 = this.server.create('program-year', {
      program: program1,
    });
    const programYear2 = this.server.create('program-year', {
      program: program2,
    });
    const programYear3 = this.server.create('program-year', {
      program: program2,
    });
    const programYear4 = this.server.create('program-year', {
      program: program2,
    });
    this.server.create('cohort', {
      programYear: programYear1,
    });
    this.server.create('cohort', {
      programYear: programYear2,
    });
    this.server.create('cohort', {
      programYear: programYear3,
    });
    this.server.create('cohort', {
      programYear: programYear4,
    });
    cohorts = await model.cohorts;
    assert.strictEqual(cohorts.length, 4);
  });
});
