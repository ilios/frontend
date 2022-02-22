import RSVP from 'rsvp';
import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render, settled, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

const { resolve } = RSVP;

module('Integration | Component | user profile learnergroups', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  const som = EmberObject.create({
    id: '1',
    title: 'SOM',
  });
  const sod = EmberObject.create({
    id: '2',
    title: 'SOD',
  });
  const program1 = EmberObject.create({
    title: 'Program1',
    school: resolve(som),
  });
  const program2 = EmberObject.create({
    title: 'Program2',
    school: resolve(sod),
  });
  som.set('programs', resolve([program1]));
  sod.set('programs', resolve([program2]));
  const programYear1 = EmberObject.create({
    program: resolve(program1),
    archived: false,
  });
  const programYear2 = EmberObject.create({
    program: resolve(program2),
    archived: false,
  });
  program1.set('programYears', resolve([programYear1]));
  program2.set('programYears', resolve([programYear2]));

  const cohort1 = EmberObject.create({
    id: 1,
    title: 'Cohort1',
    programYear: resolve(programYear1),
    program: resolve(program1),
    school: resolve(som),
  });

  const cohort2 = EmberObject.create({
    id: 2,
    title: 'Cohort2',
    programYear: resolve(programYear2),
    program: resolve(program2),
    school: resolve(sod),
  });
  programYear1.set('cohort', resolve(cohort1));
  programYear2.set('cohort', resolve(cohort2));
  const learnerGroup1 = EmberObject.create({
    id: 1,
    title: 'LearnerGroup1',
    cohort: resolve(cohort1),
  });
  const learnerGroup2 = EmberObject.create({
    id: 2,
    title: 'LearnerGroup2',
    cohort: resolve(cohort2),
  });

  const userLearnerGroups = [learnerGroup1, learnerGroup2];

  const user = EmberObject.create({
    learnerGroups: resolve(userLearnerGroups),
  });

  test('it renders', async function (assert) {
    this.set('user', user);
    await render(hbs`<UserProfileLearnergroups @user={{this.user}} />`);
    const learnerGroups = 'ul:nth-of-type(1) li';
    const firstLearnerGroup = `${learnerGroups}:nth-of-type(1)`;
    const secondLearnerGroup = `${learnerGroups}:nth-of-type(2)`;

    await settled();
    assert.dom(learnerGroups).exists({ count: 2 }, 'correct number of learner groups');
    assert.strictEqual(
      find(firstLearnerGroup)
        .textContent.trim()
        .replace(/[\n\s]+/g, ''),
      'SOD:Program2Cohort2—LearnerGroup2',
      'cohort first learner group'
    );
    assert.strictEqual(
      find(secondLearnerGroup)
        .textContent.trim()
        .replace(/[\n\s]+/g, ''),
      'SOM:Program1Cohort1—LearnerGroup1',
      'cohort second learner group'
    );
  });
});
