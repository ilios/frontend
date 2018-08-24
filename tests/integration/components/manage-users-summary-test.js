import { module, skip, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, findAll, find, fillIn, triggerEvent } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | manage users summary', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    await render(hbs`{{manage-users-summary canCreate=true}}`);

    assert.ok(find('h2').textContent.trim().startsWith('Ilios Users'));
    assert.ok(find('h2').textContent.includes('View All'));
    assert.equal(find('a').textContent.trim(), 'View All');
    assert.equal(findAll('a')[2].textContent.trim(), 'Upload Multiple Users');
  });

  /**
   * @todo Move the URL tests to an acceptance test so we don't
   * have to inject a working router which blows up ember-simple-auth
   * [JJ 3/2017]
   */
  skip('it renders URLs', function(assert) {
    this.render(hbs`{{manage-users-summary}}`);

    assert.notEqual(find('a').href.search(/\/users$/), -1, `${find('a').href} links to /users`);
    assert.notEqual(findAll('a')[1].href.search(/\/users\?addUser=true$/), -1, `${findAll('a')[1].href} links to /users?addUser=true`);
    assert.notEqual(findAll('a')[2].href.search(/\/users\?addUsers=true$/), -1, `${findAll('a')[2].href} links to /users?addUsers=true`);
  });

  test('show more input prompt', async function(assert) {
    await render(hbs`{{manage-users-summary}}`);

    const userSearch = '.user-search input';
    const results = '.user-search .results li';

    await fillIn(userSearch, '12');
    await triggerEvent(userSearch, 'keyup');

    assert.equal(findAll(results).length, 1);
    assert.equal(find(results).textContent.trim(), 'keep typing...');
  });
});
