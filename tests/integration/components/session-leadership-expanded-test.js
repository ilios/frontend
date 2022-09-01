import { module, test } from 'qunit';
import { setupRenderingTest } from 'dummy/tests/helpers';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { component } from 'ilios-common/page-objects/components/session-leadership-expanded';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Integration | Component | session leadership expanded', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  test('it renders', async function (assert) {
    assert.expect(6);
    const users = this.server.createList('user', 2);
    const course = this.server.create('course');
    const session = this.server.create('session', {
      course,
      administrators: users,
      studentAdvisors: [users[0]],
    });
    const sessionModel = await this.owner.lookup('service:store').findRecord('session', session.id);
    this.set('session', sessionModel);
    await render(hbs`<SessionLeadershipExpanded
      @session={{this.session}}
      @canUpdate={{true}}
      @collapse={{(noop)}}
      @expand={{(noop)}}
      @isManaging={{false}}
      @setIsManaging={{(noop)}}
    />`);

    assert.strictEqual(component.title, 'Session Leadership');
    assert.strictEqual(component.leadershipList.administrators.length, 2);
    assert.strictEqual(component.leadershipList.administrators[0].text, '0 guy M. Mc0son');
    assert.strictEqual(component.leadershipList.administrators[1].text, '1 guy M. Mc1son');
    assert.strictEqual(component.leadershipList.studentAdvisors.length, 1);
    assert.strictEqual(component.leadershipList.studentAdvisors[0].text, '0 guy M. Mc0son');
  });

  test('clicking the header collapses when there are administrators', async function (assert) {
    assert.expect(1);
    const administrators = this.server.createList('user', 1);
    const course = this.server.create('course');
    const session = this.server.create('session', {
      course,
      administrators,
    });
    const sessionModel = await this.owner.lookup('service:store').findRecord('session', session.id);
    this.set('session', sessionModel);
    this.set('click', () => {
      assert.ok(true, 'Action was fired');
    });
    await render(hbs`<SessionLeadershipExpanded
      @session={{this.session}}
      @canUpdate={{true}}
      @collapse={{this.click}}
      @expand={{(noop)}}
      @isManaging={{false}}
      @setIsManaging={{(noop)}}
    />`);
    await component.collapse();
  });

  test('clicking the header collapses when there are student advisors', async function (assert) {
    assert.expect(1);
    const studentAdvisors = this.server.createList('user', 1);
    const course = this.server.create('course');
    const session = this.server.create('session', {
      course,
      studentAdvisors,
    });
    const sessionModel = await this.owner.lookup('service:store').findRecord('session', session.id);
    this.set('session', sessionModel);
    this.set('click', () => {
      assert.ok(true, 'Action was fired');
    });
    await render(hbs`<SessionLeadershipExpanded
      @session={{this.session}}
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
    const session = this.server.create('session');
    const sessionModel = await this.owner.lookup('service:store').findRecord('session', session.id);
    this.set('session', sessionModel);
    this.set('click', () => {
      assert.ok(true, 'Action was fired');
    });
    await render(hbs`<SessionLeadershipExpanded
      @session={{this.session}}
      @canUpdate={{true}}
      @collapse={{(noop)}}
      @expand={{(noop)}}
      @isManaging={{false}}
      @setIsManaging={{this.click}}
    />`);
    await component.manage();
  });
});
