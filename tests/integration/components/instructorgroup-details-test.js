import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setupMirage } from 'ember-cli-mirage/test-support';

// @todo build out this component test, use page objects. [ST 2020/08/12]
module('Integration | Component | instructorgroup details', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('instructor names are listed in the right order', async function (assert) {
    const user1 = this.server.create('user', { firstName: 'Anton', lastName: 'Alpha' });
    const user2 = this.server.create('user', {
      firstName: 'Zack',
      lastName: 'Zebra',
      displayName: 'Aardvark',
    });
    const group = this.server.create('instructorGroup', { users: [user1, user2] });
    const groupModel = await this.owner.lookup('service:store').find('instructorGroup', group.id);
    this.set('group', groupModel);
    this.set('canEdit', true);
    await render(
      hbs`<InstructorgroupDetails @instructorGroup={{this.group}} @canEdit={{this.canEdit}} />`
    );
    assert.dom('.instructorgroup-users li:nth-of-type(1) [data-test-fullname]').hasText('Aardvark');
    assert.dom('.instructorgroup-users li:nth-of-type(1) [data-test-info]').exists();
    assert
      .dom('.instructorgroup-users li:nth-of-type(2) [data-test-fullname]')
      .hasText('Anton M. Alpha');
    assert.dom('.instructorgroup-users li:nth-of-type(2) [data-test-info]').doesNotExist();
  });
});
