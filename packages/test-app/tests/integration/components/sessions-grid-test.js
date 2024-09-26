import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import Service from '@ember/service';
import { click, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'test-app/tests/test-support/mirage';

module('Integration | Component | sessions-grid', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function () {
    class PermissionCheckerStub extends Service {
      canDeleteSession() {
        return true;
      }
      canUpdateSession() {
        return true;
      }
    }
    this.owner.register('service:permissionChecker', PermissionCheckerStub);
  });

  test('it renders with no results', async function (assert) {
    this.set('sessions', []);
    this.set('sortBy', 'title');
    await render(
      hbs`<SessionsGrid @sessions={{this.sessions}} @sortBy={{this.sortBy}} @setSortBy={{(noop)}} />`,
    );
    assert.dom(this.element).hasText('No results found. Please try again.');
  });

  test('clicking expand fires action', async function (assert) {
    assert.expect(1);
    const session = this.server.create('session');
    this.server.create('offering', { session });
    const sessionModel = await this.owner.lookup('service:store').findRecord('session', session.id);
    this.set('sessions', [sessionModel]);
    this.set('sortBy', 'title');
    this.set('expandSession', (s) => {
      assert.strictEqual(s, sessionModel);
    });
    await render(hbs`<SessionsGrid
  @sessions={{this.sessions}}
  @sortBy={{this.sortBy}}
  @setSortBy={{(noop)}}
  @expandSession={{this.expandSession}}
/>`);
    await click('[data-test-expand-collapse-control] svg');
  });

  test('clicking expand does not fire action when there are no offerings', async function (assert) {
    assert.expect(0);
    const session = this.server.create('session');
    const sessionModel = await this.owner.lookup('service:store').findRecord('session', session.id);
    this.set('sessions', [sessionModel]);
    this.set('sortBy', 'title');
    this.set('expandSession', () => {
      assert.ok(false);
    });
    await render(hbs`<SessionsGrid
  @sessions={{this.sessions}}
  @sortBy={{this.sortBy}}
  @setSortBy={{(noop)}}
  @expandSession={{this.expandSession}}
/>`);
    await click('[data-test-expand-collapse-control] svg');
  });

  // @see issue ilios/common#1820 [ST 2020/12/10]
  test('deletion of session is disabled if it has prerequisites', async function (assert) {
    const session1 = this.server.create('session');
    const session2 = this.server.create('session', { postrequisite: session1 });
    const sessionModel1 = await this.owner
      .lookup('service:store')
      .findRecord('session', session1.id);
    const sessionModel2 = await this.owner
      .lookup('service:store')
      .findRecord('session', session2.id);
    this.set('sessions', [sessionModel1, sessionModel2]);
    await render(hbs`<SessionsGrid
  @sessions={{this.sessions}}
  @sortBy='title'
  @setSortBy={{(noop)}}
  @expandSession={{(noop)}}
/>`);
    assert.dom('[data-test-session]:nth-of-type(1) [data-test-delete-disabled]').isVisible();
    assert.dom('[data-test-session]:nth-of-type(1) [data-test-delete]').isNotVisible();
    assert.dom('[data-test-session]:nth-of-type(2) [data-test-delete-disabled]').isNotVisible();
    assert.dom('[data-test-session]:nth-of-type(2) [data-test-delete]').isVisible();
  });
});
