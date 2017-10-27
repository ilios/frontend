import { moduleForModel,  test } from 'ember-qunit';
import moment from 'moment';
import modelList from '../../helpers/model-list';
import Ember from 'ember';

const { run } = Ember;

moduleForModel('cohort', 'Unit | Model | Cohort', {
  needs :modelList
});

test('list root level groups', async function(assert) {
  assert.expect(3);

  const model = this.subject();
  const store = this.store();

  run(async () => {
    const topGroup1 = store.createRecord('learner-group', {title:'Top Group 1', cohort: model});
    const topGroup2 = store.createRecord('learner-group', {title:'Top Group 2', cohort: model});

    const group1 = store.createRecord('learner-group', {title:'Group 1', cohort: model, parent: topGroup1});
    const group2 = store.createRecord('learner-group', {title:'Group 2', cohort: model, parent: topGroup1});
    const group3 = store.createRecord('learner-group', {title:'Group 3', cohort: model, parent: topGroup2});
    const group4 = store.createRecord('learner-group', {title:'Group 4', cohort: model, parent: topGroup2});

    model.get('learnerGroups').pushObjects([ group1, group2, group3, group4, topGroup1, topGroup2]);

    let topLevelGroups = await model.get('rootLevelLearnerGroups');

    assert.equal(topLevelGroups.length, 2);
    assert.equal(topLevelGroups.objectAt(0).get('title'), 'Top Group 1');
    assert.equal(topLevelGroups.objectAt(1).get('title'), 'Top Group 2');
  });
});

test('competencies', async function(assert){
  assert.expect(3);
  const model = this.subject();
  const store = this.store();
  run( async () => {
    const competency1 = store.createRecord('competency');
    const competency2 = store.createRecord('competency');
    const programYear = store.createRecord('program-year', { competencies: [ competency1, competency2 ] });
    model.set('programYear', programYear);
    const competencies = await model.get('competencies');
    assert.equal(competencies.length, 2);
    assert.ok(competencies.includes(competency1));
    assert.ok(competencies.includes(competency2));
  });
});

test('objectives', async function(assert){
  assert.expect(3);
  const model = this.subject();
  const store = this.store();
  run( async () => {
    const objective1 = store.createRecord('objective');
    const objective2 = store.createRecord('objective');
    const programYear = store.createRecord('program-year', { objectives: [ objective1, objective2 ] });
    model.set('programYear', programYear);
    const objectives = await model.get('objectives');
    assert.equal(objectives.length, 2);
    assert.ok(objectives.includes(objective1));
    assert.ok(objectives.includes(objective2));
  });
});

test('currentLevel', async function(assert){
  assert.expect(1);
  const model = this.subject();
  const store = this.store();
  run( async () => {
    const twoYearsAgo = moment().subtract(2, 'years').year();
    const programYear = store.createRecord('programYear', { startYear: twoYearsAgo});
    model.set('programYear', programYear);
    const currentLevel = await model.get('currentLevel');
    assert.equal(currentLevel, 2);
  });
});

test('currentLevel - no start year', async function(assert){
  assert.expect(1);
  const model = this.subject();
  const store = this.store();
  run( async () => {
    const programYear = store.createRecord('programYear');
    model.set('programYear', programYear);
    const currentLevel = await model.get('currentLevel');
    assert.equal(currentLevel, '');
  });
});

test('program', async function(assert){
  assert.expect(1);
  const model = this.subject();
  const store = this.store();
  run( async () => {
    const program1 = store.createRecord('program');
    const programYear = store.createRecord('program-year', { program: program1 });
    model.set('programYear', programYear);
    const program = await model.get('program');
    assert.equal(program, program1);
  });
});

test('school', async function(assert){
  assert.expect(1);
  const model = this.subject();
  const store = this.store();
  run( async () => {
    const school1 = store.createRecord('school');
    const program = store.createRecord('program', { school: school1 });
    const programYear = store.createRecord('program-year', { program });
    model.set('programYear', programYear);
    const school = await model.get('school');
    assert.equal(school, school1);
  });
});

test('objectives', async function(assert){
  assert.expect(3);
  const model = this.subject();
  const store = this.store();
  run( async () => {
    const objective1 = store.createRecord('objective', { position: 10, title: 'Aardvark' });
    const objective2 = store.createRecord('objective', { position: 1, title: 'Zeppelin' });
    const programYear = store.createRecord('program-year', { objectives: [ objective1, objective2 ] });
    model.set('programYear', programYear);
    const objectives = await model.get('sortedObjectives');
    assert.equal(objectives.length, 2);
    assert.equal(objectives[0], objective2);
    assert.equal(objectives[1], objective1);
  });
});

test('classOfYear', async function(assert){
  assert.expect(1);
  const model = this.subject();
  const store = this.store();
  run( async () => {
    const program = store.createRecord('program', { duration: 4 });
    const programYear = store.createRecord('program-year', { program, startYear: 2012 });
    model.set('programYear', programYear);
    const classOfYear = await model.get('classOfYear');
    assert.equal(classOfYear, 2016);
  });
});

