import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | Cohort', function (hooks) {
  setupTest(hooks);

  test('list root level groups', async function (assert) {
    assert.expect(3);

    const model = this.owner.lookup('service:store').createRecord('cohort');
    const store = this.owner.lookup('service:store');

    const topGroup1 = store.createRecord('learner-group', {
      title: 'Top Group 1',
      cohort: model,
    });
    const topGroup2 = store.createRecord('learner-group', {
      title: 'Top Group 2',
      cohort: model,
    });

    const group1 = store.createRecord('learner-group', {
      title: 'Group 1',
      cohort: model,
      parent: topGroup1,
    });
    const group2 = store.createRecord('learner-group', {
      title: 'Group 2',
      cohort: model,
      parent: topGroup1,
    });
    const group3 = store.createRecord('learner-group', {
      title: 'Group 3',
      cohort: model,
      parent: topGroup2,
    });
    const group4 = store.createRecord('learner-group', {
      title: 'Group 4',
      cohort: model,
      parent: topGroup2,
    });

    model.get('learnerGroups').pushObjects([group1, group2, group3, group4, topGroup1, topGroup2]);

    const topLevelGroups = await model.get('rootLevelLearnerGroups');

    assert.strictEqual(topLevelGroups.length, 2);
    assert.strictEqual(topLevelGroups.objectAt(0).get('title'), 'Top Group 1');
    assert.strictEqual(topLevelGroups.objectAt(1).get('title'), 'Top Group 2');
  });

  test('competencies', async function (assert) {
    assert.expect(3);
    const model = this.owner.lookup('service:store').createRecord('cohort');
    const store = this.owner.lookup('service:store');
    const competency1 = store.createRecord('competency');
    const competency2 = store.createRecord('competency');
    const programYear = store.createRecord('program-year', {
      competencies: [competency1, competency2],
    });
    model.set('programYear', programYear);
    const competencies = await model.get('competencies');
    assert.strictEqual(competencies.length, 2);
    assert.ok(competencies.includes(competency1));
    assert.ok(competencies.includes(competency2));
  });

  test('program', async function (assert) {
    assert.expect(1);
    const model = this.owner.lookup('service:store').createRecord('cohort');
    const store = this.owner.lookup('service:store');
    const program1 = store.createRecord('program');
    const programYear = store.createRecord('program-year', {
      program: program1,
    });
    model.set('programYear', programYear);
    const program = await model.get('program');
    assert.strictEqual(program, program1);
  });

  test('school', async function (assert) {
    assert.expect(1);
    const model = this.owner.lookup('service:store').createRecord('cohort');
    const store = this.owner.lookup('service:store');
    const school1 = store.createRecord('school');
    const program = store.createRecord('program', { school: school1 });
    const programYear = store.createRecord('program-year', { program });
    model.set('programYear', programYear);
    const school = await model.get('school');
    assert.strictEqual(school, school1);
  });

  test('classOfYear', async function (assert) {
    assert.expect(1);
    const model = this.owner.lookup('service:store').createRecord('cohort');
    const store = this.owner.lookup('service:store');
    const program = store.createRecord('program', { duration: 4 });
    const programYear = store.createRecord('program-year', {
      program,
      startYear: 2012,
    });
    model.set('programYear', programYear);
    const classOfYear = await model.get('classOfYear');
    assert.strictEqual(classOfYear, '2016');
  });
});
