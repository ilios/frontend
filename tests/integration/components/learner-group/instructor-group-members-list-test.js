import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { component } from 'ilios/tests/pages/components/learner-group/instructor-group-members-list';

module('Integration | Component | learner-group/instructor-group-members-list', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  test('it renders', async function (assert) {
    const users = this.server.createList('user', 3);
    const instructorGroup = this.server.create('instructor-group', { users });
    const instructorGroupModel = await this.owner
      .lookup('service:store')
      .findRecord('instructor-group', instructorGroup.id);
    this.set('instructorGroup', instructorGroupModel);
    await render(
      hbs`<LearnerGroup::InstructorGroupMembersList @instructorGroup={{this.instructorGroup}} />`,
    );
    assert.strictEqual(component.users.length, 3);
    assert.strictEqual(component.users[0].userNameInfo.fullName, '0 guy M. Mc0son');
    assert.strictEqual(component.users[1].userNameInfo.fullName, '1 guy M. Mc1son');
    assert.strictEqual(component.users[2].userNameInfo.fullName, '2 guy M. Mc2son');
  });
});
