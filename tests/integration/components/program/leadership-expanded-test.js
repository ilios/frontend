import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { component } from 'ilios/tests/pages/components/program/leadership-expanded';

module('Integration | Component | program/leadership expanded', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function (assert) {
    assert.expect(4);

    const user1 = this.server.create('user', {
      firstName: 'a',
      lastName: 'person',
    });
    const user2 = this.server.create('user', {
      firstName: 'b',
      lastName: 'person',
    });
    const program = this.server.create('program', {
      directors: [user1, user2],
    });
    const programModel = await this.owner.lookup('service:store').find('program', program.id);

    this.set('program', programModel);
    await render(hbs`<Program::LeadershipExpanded
      @program={{this.program}}
      @canUpdate={{true}}
      @collapse={{(noop)}}
      @expand={{(noop)}}
      @isManaging={{false}}
      @setIsManaging={{(noop)}}
    />`);
    assert.strictEqual(component.title, 'Program Leadership');
    assert.strictEqual(component.leadershipList.directors.length, 2);
    assert.strictEqual(component.leadershipList.directors[0].text, 'a M. person');
    assert.strictEqual(component.leadershipList.directors[1].text, 'b M. person');
  });

  test('clicking the header collapses', async function (assert) {
    assert.expect(1);
    const program = this.server.create('program');
    const programModel = await this.owner.lookup('service:store').find('program', program.id);

    this.set('program', programModel);
    this.set('click', () => {
      assert.ok(true, 'Action was fired');
    });
    await render(hbs`<Program::LeadershipExpanded
      @program={{this.program}}
      @canUpdate={{true}}
      @collapse={{this.click}}
      @expand={{(noop)}}
      @isManaging={{false}}
      @setIsManaging={{(noop)}}
    />`);
    await component.collapse();
  });

  test('clicking manage fires action', async function (assert) {
    assert.expect(1);
    const program = this.server.create('program');
    const programModel = await this.owner.lookup('service:store').find('program', program.id);

    this.set('program', programModel);
    this.set('click', () => {
      assert.ok(true, 'Action was fired');
    });
    await render(hbs`<Program::LeadershipExpanded
      @program={{this.program}}
      @canUpdate={{true}}
      @collapse={{(noop)}}
      @expand={{(noop)}}
      @isManaging={{false}}
      @setIsManaging={{this.click}}
    />`);
    await component.manage();
  });
});
