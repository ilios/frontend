import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | Objective', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    const model = this.owner.lookup('service:store').createRecord('objective');
    assert.ok(!!model);
  });

  test('active defaults to true', function(assert) {
    const model = this.owner.lookup('service:store').createRecord('objective');
    assert.ok(!!model);
    assert.ok(model.active);
  });

  test('top parent with no parents should be self', async function(assert) {
    assert.expect(2);

    const model = this.owner.lookup('service:store').createRecord('objective');
    const topParents = await model.get('topParents');
    assert.ok(topParents.length === 1);
    assert.equal(topParents.get('firstObject'), model);
  });

  test('current top parents with single parent tree', async function(assert) {
    assert.expect(2);
    const store = this.owner.lookup('service:store');
    const model = this.owner.lookup('service:store').createRecord('objective');
    const parent1 = store.createRecord('objective', {
      children: [model]
    });
    const parent2 = store.createRecord('objective', {
      children: [parent1]
    });

    const topParents = await model.get('topParents');
    assert.ok(topParents.length === 1);
    assert.equal(topParents.get('firstObject'), parent2);
  });

  test('current top parents with multi parent tree', async function(assert) {
    assert.expect(3);
    const store = this.owner.lookup('service:store');
    const model = this.owner.lookup('service:store').createRecord('objective');
    const parent1 = store.createRecord('objective', {
      children: [model]
    });
    const parent2 = store.createRecord('objective', {
      children: [model]
    });
    const parent3 = store.createRecord('objective', {
      children: [parent1]
    });
    const parent4 = store.createRecord('objective', {
      children: [parent2]
    });

    const topParents = await model.get('topParents');
    assert.ok(topParents.length === 2);
    assert.ok(topParents.includes(parent3));
    assert.ok(topParents.includes(parent4));
  });

  test('tree competencies', async function(assert) {
    assert.expect(3);
    const store = this.owner.lookup('service:store');
    const model = this.owner.lookup('service:store').createRecord('objective');
    const competency1 = store.createRecord('competency');
    const competency2 = store.createRecord('competency');

    const parent1 = store.createRecord('objective', {
      children: [model]
    });
    const parent2 = store.createRecord('objective', {
      children: [model]
    });
    const parent3 = store.createRecord('objective', {
      children: [model]
    });
    store.createRecord('objective', {
      children: [model]
    });
    store.createRecord('objective', {
      children: [parent1],
      competency: competency1
    });
    store.createRecord('objective', {
      children: [parent2],
      competency: competency1
    });
    store.createRecord('objective', {
      children: [parent2],
    });
    store.createRecord('objective', {
      children: [parent3],
      competency: competency2
    });
    store.createRecord('objective', {
      children: [parent3],
      competency: competency1
    });

    const treeCompetencies = await model.get('treeCompetencies');
    assert.equal(2, treeCompetencies.length);
    assert.ok(treeCompetencies.includes(competency1));
    assert.ok(treeCompetencies.includes(competency2));
  });


  test('removeParentWithProgramYears', async function(assert) {
    assert.expect(3);
    const store = this.owner.lookup('service:store');
    const model = store.createRecord('objective');
    model.reopen({
      async save() {
        assert.ok(true, 'save() was called.');
      }
    });
    const programYear1 = store.createRecord('programYear');
    const parentObjective1 = store.createRecord('objective');
    store.createRecord('program-year-objective', { programYear: programYear1, objective: parentObjective1 });
    const programYear2 = store.createRecord('programYear');
    const parentObjective2 = store.createRecord('objective');
    store.createRecord('program-year-objective', { programYear: programYear2, objective: parentObjective2 });
    const programYear3 = store.createRecord('programYear');
    const parentObjective3 = store.createRecord('objective');
    store.createRecord('program-year-objective', { programYear: programYear3, objective: parentObjective3 });

    model.get('parents').pushObjects([parentObjective1, parentObjective2, parentObjective3 ]);

    await model.removeParentWithProgramYears([programYear1, programYear2]);
    const parents = await model.get('parents');
    assert.equal(parents.length, 1);
    assert.ok(parents.includes(parentObjective3));
  });

  test('courses', async function(assert) {
    assert.expect(3);
    const store = this.owner.lookup('service:store');
    const model = store.createRecord('objective');
    const course1 = store.createRecord('course');
    const course2 = store.createRecord('course');
    const courseObjective1 = store.createRecord('course-objective', { course: course1, objective: model});
    const courseObjective2 = store.createRecord('course-objective', { course: course2, objective: model});
    model.get('courseObjectives').pushObjects([ courseObjective1, courseObjective2 ]);
    const courses = await model.get('courses');
    assert.equal(courses.length, 2);
    assert.ok(courses.includes(course1));
    assert.ok(courses.includes(course2));
  });

  test('sessions', async function(assert) {
    assert.expect(3);
    const store = this.owner.lookup('service:store');
    const model = store.createRecord('objective');
    const session1 = store.createRecord('session');
    const session2 = store.createRecord('session');
    const sessionObjective1 = store.createRecord('session-objective', { session: session1, objective: model});
    const sessionObjective2 = store.createRecord('session-objective', { session: session2, objective: model});
    model.get('sessionObjectives').pushObjects([ sessionObjective1, sessionObjective2 ]);
    const sessions = await model.get('sessions');
    assert.equal(sessions.length, 2);
    assert.ok(sessions.includes(session1));
    assert.ok(sessions.includes(session1));
  });

  test('programYears', async function(assert) {
    assert.expect(3);
    const store = this.owner.lookup('service:store');
    const model = store.createRecord('objective');
    const py1 = store.createRecord('program-year');
    const py2 = store.createRecord('program-year');
    const pyObjective1 = store.createRecord('program-year-objective', { programYear: py1, objective: model});
    const pyObjective2 = store.createRecord('program-year-objective', { programYear: py2, objective: model});
    model.get('programYearObjectives').pushObjects([ pyObjective1, pyObjective2 ]);
    const programYears = await model.get('programYears');
    assert.equal(programYears.length, 2);
    assert.ok(programYears.includes(py1));
    assert.ok(programYears.includes(py2));
  });
});
