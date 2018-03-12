import RSVP from 'rsvp';
import EmberObject from '@ember/object';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';

const { resolve } = RSVP;

moduleForComponent('user-profile-learnergroups', 'Integration | Component | user profile learnergroups', {
  integration: true
});
let som = EmberObject.create({
  id: '1',
  title: 'SOM'
});
let sod = EmberObject.create({
  id: '2',
  title: 'SOD'
});
let program1 = EmberObject.create({
  title: 'Program1',
  school: resolve(som)
});
let program2 = EmberObject.create({
  title: 'Program2',
  school: resolve(sod)
});
som.set('programs', resolve([program1]));
sod.set('programs', resolve([program2]));
let programYear1 = EmberObject.create({
  program: resolve(program1),
  published: true,
  archived: false,
});
let programYear2 = EmberObject.create({
  program: resolve(program2),
  published: true,
  archived: false,
});
program1.set('programYears', resolve([programYear1]));
program2.set('programYears', resolve([programYear2]));

let cohort1 = EmberObject.create({
  id: 1,
  title: 'Cohort1',
  programYear: resolve(programYear1),
  program: resolve(program1),
  school: resolve(som)
});

let cohort2 = EmberObject.create({
  id: 2,
  title: 'Cohort2',
  programYear: resolve(programYear2),
  program: resolve(program2),
  school: resolve(sod)
});
programYear1.set('cohort', resolve(cohort1));
programYear2.set('cohort', resolve(cohort2));
let learnerGroup1 = EmberObject.create({
  id: 1,
  title: 'LearnerGroup1',
  cohort: resolve(cohort1),
});
let learnerGroup2 = EmberObject.create({
  id: 2,
  title: 'LearnerGroup2',
  cohort: resolve(cohort2),
});

let userLearnerGroups = [learnerGroup1, learnerGroup2];

let user = EmberObject.create({
  learnerGroups: resolve(userLearnerGroups),
});


test('it renders', async function(assert) {
  this.set('user', user);
  this.render(hbs`{{user-profile-learnergroups user=user}}`);
  const learnerGroups = 'ul:eq(0) li';
  const firstLearnerGroup = `${learnerGroups}:eq(0)`;
  const secondLearnerGroup = `${learnerGroups}:eq(1)`;

  await wait();
  assert.equal(this.$(learnerGroups).length, 2, 'correct number of learner groups');
  assert.equal(this.$(firstLearnerGroup).text().trim().replace(/[\n\s]+/g, ""), 'SOD:Program2Cohort2—LearnerGroup2', 'cohort first learner group');
  assert.equal(this.$(secondLearnerGroup).text().trim().replace(/[\n\s]+/g, ""), 'SOM:Program1Cohort1—LearnerGroup1', 'cohort second learner group');
});
