import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import { component } from 'frontend/tests/pages/components/user-profile/learner-groups';
import LearnerGroups from 'frontend/components/user-profile/learner-groups';

module('Integration | Component | user-profile/learner-groups', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function (assert) {
    const som = this.server.create('school', {
      title: 'SOM',
    });
    const sod = this.server.create('school', {
      title: 'SOD',
    });
    const program1 = this.server.create('program', {
      title: 'Program1',
      school: som,
    });
    const program2 = this.server.create('program', {
      title: 'Program2',
      school: sod,
    });
    const programYear1 = this.server.create('program-year', {
      program: program1,
      archived: false,
    });
    const programYear2 = this.server.create('program-year', {
      program: program2,
      archived: false,
    });
    const cohort1 = this.server.create('cohort', {
      title: 'Cohort1',
      programYear: programYear1,
    });
    const cohort2 = this.server.create('cohort', {
      title: 'Cohort2',
      programYear: programYear2,
    });
    const learnerGroup1 = this.server.create('learner-group', {
      title: 'LearnerGroup1',
      cohort: cohort1,
    });
    const learnerGroup2 = this.server.create('learner-group', {
      title: 'LearnerGroup2',
      cohort: cohort2,
    });
    const user = this.server.create('user', {
      learnerGroups: [learnerGroup1, learnerGroup2],
    });
    const userModel = await this.owner.lookup('service:store').findRecord('user', user.id);
    this.set('user', userModel);
    await render(<template><LearnerGroups @user={{this.user}} /></template>);
    assert.strictEqual(component.groups.length, 2);
    assert.strictEqual(component.groups[0].text, 'SOD: Program2 Cohort2 — LearnerGroup2');
    assert.strictEqual(component.groups[1].text, 'SOM: Program1 Cohort1 — LearnerGroup1');
  });
});
