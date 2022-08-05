import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { component } from 'ilios/tests/pages/components/program-year/leadership-expanded';

module('Integration | Component | program-year/leadership-expanded', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
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
    const program = this.server.create('program');
    const programYear = this.server.create('programYear', {
      directors: [user1, user2],
      program,
    });
    const programYearModel = await this.owner
      .lookup('service:store')
      .find('programYear', programYear.id);
    this.set('programYear', programYearModel);
    await render(hbs`<ProgramYear::LeadershipExpanded
      @programYear={{this.programYear}}
      @canUpdate={{true}}
      @collapse={{(noop)}}
      @expand={{(noop)}}
      @isManaging={{false}}
      @setIsManaging={{(noop)}}
    />`);
    assert.strictEqual(component.title, 'Program Year Leadership');
    assert.strictEqual(component.leadershipList.directors.length, 2);
    assert.strictEqual(component.leadershipList.directors[0].text, 'a M. person');
    assert.strictEqual(component.leadershipList.directors[1].text, 'b M. person');
  });

  test('clicking the header collapses', async function (assert) {
    assert.expect(1);
    const program = this.server.create('program');
    const programYear = this.server.create('programYear', {
      program,
    });
    const programYearModel = await this.owner
      .lookup('service:store')
      .find('programYear', programYear.id);
    this.set('programYear', programYearModel);
    this.set('click', () => {
      assert.ok(true, 'Action was fired');
    });
    await render(hbs`<ProgramYear::LeadershipExpanded
      @programYear={{this.programYear}}
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
    const programYear = this.server.create('programYear', {
      program,
    });
    const programYearModel = await this.owner
      .lookup('service:store')
      .find('programYear', programYear.id);
    this.set('programYear', programYearModel);
    this.set('click', () => {
      assert.ok(true, 'Action was fired');
    });
    await render(hbs`<ProgramYear::LeadershipExpanded
      @programYear={{this.programYear}}
      @canUpdate={{true}}
      @collapse={{(noop)}}
      @expand={{(noop)}}
      @isManaging={{false}}
      @setIsManaging={{this.click}}
    />`);
    await component.manage();
  });
});
