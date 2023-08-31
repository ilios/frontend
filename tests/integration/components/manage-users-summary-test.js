import { module, skip, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render, findAll, find, fillIn, triggerEvent } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import Service from '@ember/service';

module('Integration | Component | manage users summary', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');

  hooks.beforeEach(async function () {
    const iliosConfig = class extends Service {
      async getUserSearchType() {
        return 'local';
      }
      async getSearchEnabled() {
        return false;
      }
    };
    this.owner.register('service:iliosConfig', iliosConfig);
  });

  test('it renders', async function (assert) {
    await render(hbs`<ManageUsersSummary @canCreate={{true}} />`);

    assert.ok(find('h2').textContent.trim().startsWith('Ilios Users'));
    assert.ok(find('h2').textContent.includes('View All'));
    assert.dom('a').hasText('View All');
    assert.dom(findAll('a')[2]).hasText('Upload Multiple Users');
  });

  /**
   * @todo Move the URL tests to an acceptance test so we don't
   * have to inject a working router which blows up ember-simple-auth
   * [JJ 3/2017]
   */
  skip('it renders URLs', function (assert) {
    render(hbs`<ManageUsersSummary />`);

    assert.notEqual(find('a').href.search(/\/users$/), -1, `${find('a').href} links to /users`);
    assert.notEqual(
      findAll('a')[1].href.search(/\/users\?addUser=true$/),
      -1,
      `${findAll('a')[1].href} links to /users?addUser=true`,
    );
    assert.notEqual(
      findAll('a')[2].href.search(/\/users\?addUsers=true$/),
      -1,
      `${findAll('a')[2].href} links to /users?addUsers=true`,
    );
  });

  test('show more input prompt', async function (assert) {
    await render(hbs`<ManageUsersSummary />`);

    const userSearch = '.user-search input';
    const results = '.user-search .results li';

    await fillIn(userSearch, '12');
    await triggerEvent(userSearch, 'keyup');

    assert.dom(results).exists({ count: 1 });
    assert.dom(results).hasText('keep typing...');
  });
});
