import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { component } from 'ilios-common/page-objects/components/user-search-result';

module('Integration | Component | user-search-result-instructor-group', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  test('it renders', async function (assert) {
    const group = this.server.create('instructor-group');
    const groupModel = await this.owner.lookup('service:store').find('instructor-group', group.id);
    this.set('group', groupModel);
    await render(hbs`<UserSearchResultInstructorGroup
      @group={{this.group}}
      @addInstructorGroup={{(noop)}}
    />`);
    assert.strictEqual(component.text, 'instructor group 0');
    assert.ok(component.isActive);
  });

  test('inactive if it is already selected', async function (assert) {
    const group = this.server.create('instructor-group');
    const groupModel = await this.owner.lookup('service:store').find('instructor-group', group.id);
    this.set('group', groupModel);
    this.set('activeGroups', [groupModel]);
    await render(hbs`<UserSearchResultInstructorGroup
      @group={{this.group}}
      @addInstructorGroup={{(noop)}}
      @currentlyActiveInstructorGroups={{this.activeGroups}}
    />`);
    assert.strictEqual(component.text, 'instructor group 0');
    assert.notOk(component.isActive);
  });

  test('click fires action', async function (assert) {
    assert.expect(3);
    const group = this.server.create('instructor-group');
    const groupModel = await this.owner.lookup('service:store').find('instructor-group', group.id);
    this.set('group', groupModel);
    this.set('add', (add) => {
      assert.strictEqual(add, groupModel);
    });
    await render(hbs`<UserSearchResultInstructorGroup
      @group={{this.group}}
      @addInstructorGroup={{this.add}}
      @currentlyActiveInstructorGroups={{(array)}}
    />`);
    assert.strictEqual(component.text, 'instructor group 0');
    assert.ok(component.isActive);
    await component.click();
  });
});
