import { module, skip, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | manage users summary', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    await render(hbs`{{manage-users-summary}}`);

    assert.equal(this.$('h2').text().trim(), 'Ilios Users (View All)');
    assert.equal(this.$('a:eq(0)').text().trim(), 'View All');
    assert.equal(this.$('a:eq(2)').text().trim(), 'Upload Multiple Users');
  });

  /**
   * @todo Move the URL tests to an acceptance test so we don't
   * have to inject a working router which blows up ember-simple-auth
   * [JJ 3/2017]
   */
  skip('it renders URLs', function(assert) {
    this.render(hbs`{{manage-users-summary}}`);

    assert.notEqual(this.$('a:eq(0)').prop('href').search(/\/users$/), -1, `${this.$('a:eq(0)').prop('href')} links to /users`);
    assert.notEqual(this.$('a:eq(1)').prop('href').search(/\/users\?addUser=true$/), -1, `${this.$('a:eq(1)').prop('href')} links to /users?addUser=true`);
    assert.notEqual(this.$('a:eq(2)').prop('href').search(/\/users\?addUsers=true$/), -1, `${this.$('a:eq(2)').prop('href')} links to /users?addUsers=true`);
  });

  test('show more input prompt', async function(assert) {
    await render(hbs`{{manage-users-summary}}`);

    const userSearch = '.user-search input';
    const results = '.user-search .results li';

    this.$(userSearch).val('12');
    this.$(userSearch).trigger('keyup');

    return settled().then(()=>{
      assert.equal(this.$(results).length, 1);
      assert.equal(this.$(results).text().trim(), 'keep typing...');
    });
  });
});
