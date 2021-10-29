import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Integration | Component | user-search-result-instructor-group', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function (assert) {
    this.server.create('instructor-group');
    const group = await this.owner.lookup('service:store').find('instructor-group', 1);
    this.set('group', group);
    await render(hbs`<UserSearchResultInstructorGroup
      @group={{this.group}}
      @addInstructorGroup={{(noop)}}
    />`);
    assert.dom('[data-test-result]').includesText('instructor group 0');
    assert.dom('[data-test-result]').hasClass('active');
  });

  test('inactive if it is already selected', async function (assert) {
    this.server.create('instructor-group');
    const group = await this.owner.lookup('service:store').find('instructor-group', 1);
    this.set('group', group);
    await render(hbs`<UserSearchResultInstructorGroup
      @group={{this.group}}
      @addInstructorGroup={{(noop)}}
      @currentlyActiveInstructorGroups={{array this.group}}
    />`);
    assert.dom('[data-test-result]').includesText('instructor group 0');
    assert.dom('[data-test-result]').hasClass('inactive');
  });

  test('click fires action', async function (assert) {
    assert.expect(3);
    this.server.create('instructor-group');
    const group = await this.owner.lookup('service:store').find('instructor-group', 1);
    this.set('group', group);
    this.set('add', (add) => {
      assert.strictEqual(add, group);
    });
    await render(hbs`<UserSearchResultInstructorGroup
      @group={{this.group}}
      @addInstructorGroup={{this.add}}
      @currentlyActiveInstructorGroups={{(array)}}
    />`);
    assert.dom('[data-test-result]').includesText('instructor group 0');
    assert.dom('[data-test-result]').hasClass('active');
    await click('[data-test-result]');
  });
});
