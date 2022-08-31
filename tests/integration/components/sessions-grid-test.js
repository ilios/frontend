import { module, test } from 'qunit';
import { setupRenderingTest } from 'dummy/tests/helpers';
import { setupIntl } from 'ember-intl/test-support';
import { click, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Integration | Component | sessions-grid', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  test('it renders with no results', async function (assert) {
    this.set('sessions', []);
    this.set('sortBy', 'title');
    this.set('setSortBy', () => {});
    await render(hbs`<SessionsGrid
      @sessions={{this.sessions}}
      @sortBy={{this.sortBy}}
      @setSortBy={{this.setSortBy}}
    />`);

    assert.dom(this.element).hasText('No results found. Please try again.');
  });

  test('clicking expand fires action', async function (assert) {
    assert.expect(1);
    const session = {
      id: 1,
    };
    this.set('sessions', [
      {
        session,
        offeringCount: 1,
      },
    ]);
    this.set('sortBy', 'title');
    this.set('setSortBy', () => {});
    this.set('expandSession', (s) => {
      assert.strictEqual(s, session);
    });
    await render(hbs`<SessionsGrid
      @sessions={{this.sessions}}
      @sortBy={{this.sortBy}}
      @setSortBy={{this.setSortBy}}
      @expandSession={{this.expandSession}}
    />`);

    await click('[data-test-expand-collapse-control] svg');
  });

  test('clicking expand does not fire action when there are no offerings', async function (assert) {
    assert.expect(0);
    const session = {
      id: 1,
    };
    this.set('sessions', [
      {
        session,
        offeringCount: 0,
      },
    ]);
    this.set('sortBy', 'title');
    this.set('setSortBy', () => {});
    this.set('expandSession', () => {
      assert.ok(false);
    });
    await render(hbs`<SessionsGrid
      @sessions={{this.sessions}}
      @sortBy={{this.sortBy}}
      @setSortBy={{this.setSortBy}}
      @expandSession={{this.expandSession}}
    />`);

    await click('[data-test-expand-collapse-control] svg');
  });

  // @see issue ilios/common#1820 [ST 2020/12/10]
  test('deletion of session is disabled if it has prerequisites', async function (assert) {
    const sessions = this.server.createList('session', 2);
    const sessionModel1 = await this.owner
      .lookup('service:store')
      .findRecord('session', sessions[0].id);
    const sessionModel2 = await this.owner
      .lookup('service:store')
      .findRecord('session', sessions[0].id);

    this.set('sessions', [
      {
        sessionModel1,
        prerequisiteCount: 1,
        canUpdate: true,
      },
      {
        sessionModel2,
        prerequisiteCount: 0,
        canUpdate: true,
      },
    ]);
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
