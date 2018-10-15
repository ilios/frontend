import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Integration | Component | sessions-grid', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function(assert) {
    this.set('sessions', []);
    this.set('sortBy', 'title');
    this.set('setSortBy', () => { });
    await render(hbs`{{sessions-grid
      sessions=sessions
      sortBy=sortBy
      setSortBy=(action setSortBy)
    }}`);

    assert.equal(this.element.textContent.trim(), '');
  });

  test('clicking expand fires action', async function (assert) {
    const session = {
      id: 1
    };
    this.set('sessions', [{
      session,
      offeringCount: 1
    }]);
    this.set('sortBy', 'title');
    this.set('setSortBy', () => { });
    this.set('expandSession', (s) => {
      assert.equal(s, session);
    });
    await render(hbs`{{sessions-grid
      sessions=sessions
      sortBy=sortBy
      setSortBy=(action setSortBy)
      expandSession=(action expandSession)
    }}`);

    await click('[data-test-expand-collapse-control] svg');
  });

  test('clicking expand does not fire action when there are no offerings', async function (assert) {
    assert.expect(0);
    const session = {
      id: 1
    };
    this.set('sessions', [{
      session,
      offeringCount: 0
    }]);
    this.set('sortBy', 'title');
    this.set('setSortBy', () => { });
    this.set('expandSession', () => {
      assert.ok(false);
    });
    await render(hbs`{{sessions-grid
      sessions=sessions
      sortBy=sortBy
      setSortBy=(action setSortBy)
      expandSession=(action expandSession)
    }}`);

    await click('[data-test-expand-collapse-control] svg');
  });
});
