import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { setupMSW } from 'frontend/tests/msw';
import { component } from 'frontend/tests/pages/components/user-search-result';
import UserSearchResultInstructorGroup from 'frontend/components/user-search-result-instructor-group';
import noop from 'frontend/helpers/noop';
import { array } from '@ember/helper';

module('Integration | Component | user-search-result-instructor-group', function (hooks) {
  setupRenderingTest(hooks);
  setupMSW(hooks);

  test('it renders', async function (assert) {
    const group = await this.server.create('instructor-group');
    const groupModel = await this.owner
      .lookup('service:store')
      .findRecord('instructor-group', group.id);
    this.set('group', groupModel);
    await render(
      <template>
        <UserSearchResultInstructorGroup @group={{this.group}} @addInstructorGroup={{(noop)}} />
      </template>,
    );
    assert.strictEqual(component.text, 'instructor group 0');
    assert.ok(component.isActive);
  });

  test('inactive if it is already selected', async function (assert) {
    const group = await this.server.create('instructor-group');
    const groupModel = await this.owner
      .lookup('service:store')
      .findRecord('instructor-group', group.id);
    this.set('group', groupModel);
    this.set('activeGroups', [groupModel]);
    await render(
      <template>
        <UserSearchResultInstructorGroup
          @group={{this.group}}
          @addInstructorGroup={{(noop)}}
          @currentlyActiveInstructorGroups={{this.activeGroups}}
        />
      </template>,
    );
    assert.strictEqual(component.text, 'instructor group 0');
    assert.notOk(component.isActive);
  });

  test('click fires action', async function (assert) {
    const group = await this.server.create('instructor-group');
    const groupModel = await this.owner
      .lookup('service:store')
      .findRecord('instructor-group', group.id);
    this.set('group', groupModel);
    this.set('add', (add) => {
      assert.step('add called');
      assert.strictEqual(add, groupModel);
    });
    await render(
      <template>
        <UserSearchResultInstructorGroup
          @group={{this.group}}
          @addInstructorGroup={{this.add}}
          @currentlyActiveInstructorGroups={{(array)}}
        />
      </template>,
    );
    assert.strictEqual(component.text, 'instructor group 0');
    assert.ok(component.isActive);
    await component.click();
    assert.verifySteps(['add called']);
  });
});
