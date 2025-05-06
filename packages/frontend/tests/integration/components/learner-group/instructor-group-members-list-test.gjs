import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import { component } from 'frontend/tests/pages/components/learner-group/instructor-group-members-list';
import InstructorGroupMembersList from 'frontend/components/learner-group/instructor-group-members-list';

module('Integration | Component | learner-group/instructor-group-members-list', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function (assert) {
    const users = this.server.createList('user', 3);
    const instructorGroup = this.server.create('instructor-group', { users });
    const instructorGroupModel = await this.owner
      .lookup('service:store')
      .findRecord('instructor-group', instructorGroup.id);
    this.set('instructorGroup', instructorGroupModel);
    await render(
      <template><InstructorGroupMembersList @instructorGroup={{this.instructorGroup}} /></template>,
    );
    assert.strictEqual(component.users.length, 3);
    assert.strictEqual(component.users[0].userNameInfo.fullName, '0 guy M. Mc0son');
    assert.strictEqual(component.users[1].userNameInfo.fullName, '1 guy M. Mc1son');
    assert.strictEqual(component.users[2].userNameInfo.fullName, '2 guy M. Mc2son');
  });
});
