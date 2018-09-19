import { resolve } from 'rsvp';
import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find, findAll, fillIn } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { run } from '@ember/runloop';
import ENV from 'ilios/config/environment';

const { apiVersion } = ENV.APP;

module('Integration | Component | ilios users', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function(assert) {
    const title = '.users .title';
    await render(hbs`{{ilios-users}}`);
    assert.dom(title).hasText('Users');
  });

  test('param passing', async function(assert) {
    assert.expect(2);

    const query = '.user-search input';
    const value = 'nothing';
    this.set('value', value);
    await render(
      hbs`{{ilios-users query=value limit=25 offset=25 setQuery=(action (mut value) value="target.value")}}`
    );

    assert.equal(find(query).value.trim(), 'nothing');
    await fillIn(query, 'test');
    assert.equal(this.get('value'), 'test');
  });

  test('add user form renders when configured to', async function(assert) {
    assert.expect(3);
    this.server.get('application/config', function() {
      return { config: {
        type: 'form',
        userSearchType: 'form',
        apiVersion
      }};
    });
    const school = this.server.create('school');
    const user = this.server.create('user', {
      school
    });
    const userModel = await run(() => this.owner.lookup('service:store').find('user', user.id));

    const currentUserMock = Service.extend({
      model: resolve(userModel),
      getRolesInSchool() {
        return [];
      }
    });
    this.owner.register('service:currentUser', currentUserMock);

    this.set('nothing', parseInt);
    await render(hbs`{{ilios-users
      setShowNewUserForm=(action nothing)
      transitionToUser=(action nothing)
      setSearchTerms=(action nothing)
      showNewUserForm=true
    }}`);
    const form = '.new-user-form';
    const blocks = `${form} .item`;
    const directorySearchBox = '.new-directory-user-search-tools';
    assert.dom(form).exists({ count: 1 }, 'the user search form is present');
    assert.ok(findAll(blocks).length > 4, 'there are many form fields for adding a new user');
    assert.dom(directorySearchBox).doesNotExist('the directory form search form is not present');
  });

  test('directory search renders when configured to', async function(assert) {
    assert.expect(3);
    this.server.get('application/config', function() {
      return { config: {
        type: 'form',
        userSearchType: 'ldap',
        apiVersion
      }};
    });

    const school = this.server.create('school');
    const user = this.server.create('user', {
      school
    });
    const userModel = await run(() => this.owner.lookup('service:store').find('user', user.id));

    const currentUserMock = Service.extend({
      model: resolve(userModel),
      getRolesInSchool() {
        return [];
      }
    });
    this.owner.register('service:currentUser', currentUserMock);

    this.set('nothing', parseInt);

    await render(hbs`{{ilios-users
      setShowNewUserForm=(action nothing)
      transitionToUser=(action nothing)
      setSearchTerms=(action nothing)
      showNewUserForm=true
    }}`);
    const form = '.new-user-form';
    const blocks = `${form} .item`;
    const directorySearchBox = '.new-directory-user-search-tools';
    assert.dom(form).doesNotExist('the user search form is not present');
    assert.dom(blocks).doesNotExist('there are no form fields for adding a new user');
    assert.dom(directorySearchBox).exists({ count: 1 }, 'the directory form search form is present');
  });
});
