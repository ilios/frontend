import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import LearnerGroup from 'frontend/components/user-profile/learner-group';

module('Integration | Component | user-profile/learner-group', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function (assert) {
    const school = this.server.create('school', {});
    const program = this.server.create('program', {
      school,
    });
    const programYear = this.server.create('program-year', {
      program,
      archived: false,
    });
    const cohort = this.server.create('cohort', {
      programYear,
    });
    const learnerGroup = this.server.create('learner-group', {
      cohort,
    });
    const model = await this.owner
      .lookup('service:store')
      .findRecord('learner-group', learnerGroup.id);
    this.set('learnerGroup', model);
    await render(<template><LearnerGroup @learnerGroup={{this.learnerGroup}} /></template>);

    assert.dom(this.element).hasText('school 0: program 0 cohort 0 — learner group 0');
  });
});
