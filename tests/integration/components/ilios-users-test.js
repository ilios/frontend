import { resolve } from 'rsvp';
import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find, findAll, fillIn } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Integration | Component | ilios users', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function(assert) {
    const title = '.users .title';
    await render(hbs`<IliosUsers
      @limit=25
      @offset=25
      @query=""
      @searchTerms={{array}}
      @setQuery={{noop}}
      @setLimit={{noop}}
      @setOffset={{noop}}
      @setShowNewUserForm={{noop}}
      @setShowBulkNewUserForm={{noop}}
      @setSearchTerms={{noop}}
      @transitionToUser={{noop}}
    />`);
    assert.dom(title).hasText('Users');
  });

  test('param passing', async function(assert) {
    assert.expect(2);

    const query = '.user-search input';
    const value = 'nothing';
    const newValue = 'test';
    this.set('value', value);
    this.set('setQuery', query => {
      assert.equal(query, newValue);
    });
    await render(hbs`<IliosUsers
      @limit=25
      @offset=25
      @query={{this.value}}
      @searchTerms={{array}}
      @setQuery={{this.setQuery}}
      @setLimit={{noop}}
      @setOffset={{noop}}
      @setShowNewUserForm={{noop}}
      @setShowBulkNewUserForm={{noop}}
      @setSearchTerms={{noop}}
      @transitionToUser={{noop}}
    />`);

    assert.equal(find(query).value.trim(), value);
    await fillIn(query, newValue);
  });

  test('add user form renders when configured to', async function(assert) {
    assert.expect(4);
    const { apiVersion } = this.owner.resolveRegistration('config:environment');
    assert.ok(apiVersion);
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
    const userModel = await this.owner.lookup('service:store').find('user', user.id);

    const currentUserMock = Service.extend({
      model: resolve(userModel),
      getRolesInSchool() {
        return [];
      }
    });
    this.owner.register('service:currentUser', currentUserMock);
    await render(hbs`<IliosUsers
      @showNewUserForm={{true}}
      @searchTerms={{array}}
      @setQuery={{noop}}
      @setLimit={{noop}}
      @setOffset={{noop}}
      @setShowNewUserForm={{noop}}
      @setShowBulkNewUserForm={{noop}}
      @setSearchTerms={{noop}}
      @transitionToUser={{noop}}
    />`);
    const form = '.new-user-form';
    const blocks = `${form} .item`;
    const directorySearchBox = '.new-directory-user-search-tools';
    assert.dom(form).exists({ count: 1 }, 'the user search form is present');
    assert.ok(findAll(blocks).length > 4, 'there are many form fields for adding a new user');
    assert.dom(directorySearchBox).doesNotExist('the directory form search form is not present');
  });

  test('directory search renders when configured to', async function(assert) {
    assert.expect(4);
    const { apiVersion } = this.owner.resolveRegistration('config:environment');
    assert.ok(apiVersion);
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
    const userModel = await this.owner.lookup('service:store').find('user', user.id);

    const currentUserMock = Service.extend({
      model: resolve(userModel),
      getRolesInSchool() {
        return [];
      }
    });
    this.owner.register('service:currentUser', currentUserMock);

    this.set('nothing', parseInt);

    await render(hbs`<IliosUsers
      @showNewUserForm={{true}}
      @searchTerms={{array}}
      @setQuery={{noop}}
      @setLimit={{noop}}
      @setOffset={{noop}}
      @setShowNewUserForm={{noop}}
      @setShowBulkNewUserForm={{noop}}
      @setSearchTerms={{noop}}
      @transitionToUser={{noop}}
    />`);
    const form = '.new-user-form';
    const blocks = `${form} .item`;
    const directorySearchBox = '.new-directory-user-search-tools';
    assert.dom(form).doesNotExist('the user search form is not present');
    assert.dom(blocks).doesNotExist('there are no form fields for adding a new user');
    assert.dom(directorySearchBox).exists({ count: 1 }, 'the directory form search form is present');
  });
});
