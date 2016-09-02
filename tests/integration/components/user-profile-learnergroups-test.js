import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';
import wait from 'ember-test-helpers/wait';

const { RSVP, Object } = Ember;
const { resolve } = RSVP;

moduleForComponent('user-profile-learnergroups', 'Integration | Component | user profile learnergroups', {
  integration: true
});
let som = Object.create({
  id: '1',
  title: 'SOM'
});
let sod = Object.create({
  id: '2',
  title: 'SOD'
});
let program1 = Object.create({
  title: 'Program1',
  school: resolve(som)
});
let program2 = Object.create({
  title: 'Program2',
  school: resolve(sod)
});
som.set('programs', resolve([program1]));
sod.set('programs', resolve([program2]));
let programYear1 = Object.create({
  program: resolve(program1),
  published: true,
  archived: false,
});
let programYear2 = Object.create({
  program: resolve(program2),
  published: true,
  archived: false,
});
program1.set('programYears', resolve([programYear1]));
program2.set('programYears', resolve([programYear2]));

let cohort1 = Object.create({
  id: 1,
  title: 'Cohort1',
  programYear: resolve(programYear1),
  program: resolve(program1),
  school: resolve(som)
});

let cohort2 = Object.create({
  id: 2,
  title: 'Cohort2',
  programYear: resolve(programYear2),
  program: resolve(program2),
  school: resolve(sod)
});
programYear1.set('cohort', resolve(cohort1));
programYear2.set('cohort', resolve(cohort2));
let learnerGroup1 = Object.create({
  id: 1,
  title: 'LearnerGroup1',
  cohort: resolve(cohort1),
});
let learnerGroup2 = Object.create({
  id: 2,
  title: 'LearnerGroup2',
  cohort: resolve(cohort2),
});

let userlearnergroups = [learnerGroup1, learnerGroup2];

let user = Object.create({
  learnerGroups: resolve(userlearnergroups),
});


test('it renders', function(assert) {
  this.set('user', user);
  this.render(hbs`{{user-profile-learnergroups user=user}}`);
  const learnerGroups = 'ul:eq(0) li';
  const firstLearnerGroup = `${learnerGroups}:eq(0)`;
  const secondLearnerGroup = `${learnerGroups}:eq(1)`;

  return wait().then(()=>{
    assert.equal(this.$(learnerGroups).length, 2, 'correct number of learner groups');
    assert.equal(this.$(firstLearnerGroup).text().trim().replace(/[\n\s]+/g, ""), 'SOD:Program2Cohort2—LearnerGroup2', 'cohort first learner group');
    assert.equal(this.$(secondLearnerGroup).text().trim().replace(/[\n\s]+/g, ""), 'SOM:Program1Cohort1—LearnerGroup1', 'cohort second learner group');
  });
});
