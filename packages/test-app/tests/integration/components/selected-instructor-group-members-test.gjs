import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { component } from 'ilios-common/page-objects/components/selected-instructor-group-members';
import { setupMirage } from 'test-app/tests/test-support/mirage';
import { a11yAudit } from 'ember-a11y-testing/test-support';
import SelectedInstructorGroupMembers from 'ilios-common/components/selected-instructor-group-members';

module('Integration | Component | selected-instructor-group-members', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const instructor1 = this.server.create('user', {
      firstName: 'Joe',
      lastName: 'Doe',
      middleName: 'Michael',
    });
    const instructor2 = this.server.create('user', {
      firstName: 'Jane',
      lastName: 'Doe',
      middleName: 'Anette',
    });
    const instructor3 = this.server.create('user', {
      displayName: 'Clem Chowder',
    });
    const instructorGroup = this.server.create('instructor-group', {
      users: [instructor1, instructor2, instructor3],
    });
    this.instructorGroup = await this.owner
      .lookup('service:store')
      .findRecord('instructor-group', instructorGroup.id);
  });

  test('it renders', async function (assert) {
    this.set('instructorGroup', this.instructorGroup);
    await render(
      <template>
        <SelectedInstructorGroupMembers @instructorGroup={{this.instructorGroup}} />
      </template>,
    );
    assert.strictEqual(component.members.length, 3);
    assert.strictEqual(component.members[0].userNameInfo.fullName, 'Clem Chowder');
    assert.ok(component.members[0].userNameInfo.hasAdditionalInfo);
    assert.strictEqual(component.members[1].userNameInfo.fullName, 'Jane A. Doe');
    assert.notOk(component.members[1].userNameInfo.hasAdditionalInfo);
    assert.strictEqual(component.members[2].userNameInfo.fullName, 'Joe M. Doe');
    assert.notOk(component.members[2].userNameInfo.hasAdditionalInfo);
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });
});
