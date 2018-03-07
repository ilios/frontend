import RSVP from 'rsvp';
import Service from '@ember/service';
import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

const { resolve } = RSVP;

module('Integration | Component | ilios users', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    const title = '.users .title';
    await render(hbs`{{ilios-users}}`);
    assert.equal(this.$(title).text().trim(), 'Users');
  });

  test('param passing', async function(assert) {
    assert.expect(6);

    let storeMock = Service.extend({
      query(what, {q, limit, offset}){

        assert.equal('user', what);
        assert.equal(25, limit);
        assert.equal(25, offset);
        assert.equal('nothing', q);
        return resolve([]);
      }
    });
    this.owner.register('service:store', storeMock);

    const query = '.user-search input';
    const value = 'nothing';
    this.set('value', value);
    await render(
      hbs`{{ilios-users query=value limit=25 offset=25 setQuery=(action (mut value) value="target.value")}}`
    );
    await settled();

    assert.equal(this.$(query).val().trim(), 'nothing');
    this.$(query).val('test').trigger('input');
    assert.equal(this.get('value'), 'test');

  });

  test('add user form renders when configured to', async function(assert) {
    assert.expect(3);
    let storeMock = Service.extend({
      query(){
        return resolve([]);
      }
    });
    this.owner.register('service:store', storeMock);
    const iliosConfigMock = Service.extend({
      userSearchType: resolve('form')
    });
    this.owner.register('service:iliosConfig', iliosConfigMock);
    const mockSchools = [
      {id: 1, title: 'first', cohorts: resolve([])},
    ];
    const mockUser = EmberObject.create({
      schools: resolve(mockSchools),
      school: resolve(EmberObject.create(mockSchools[0]))
    });

    const currentUserMock = Service.extend({
      model: resolve(mockUser)
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
    await settled();
    assert.equal(this.$(form).length, 1, 'the user search form is present');
    assert.ok(this.$(blocks).length > 4, 'there are many form fields for adding a new user');
    assert.equal(this.$(directorySearchBox).length, 0, 'the directory form search form is not present');
  });

  test('directory search renders when configured to', async function(assert) {
    assert.expect(3);
    let storeMock = Service.extend({
      query(){
        return resolve([]);
      }
    });
    this.owner.register('service:store', storeMock);
    const iliosConfigMock = Service.extend({
      userSearchType: resolve('ldap')
    });
    this.owner.register('service:iliosConfig', iliosConfigMock);
    const mockSchools = [
      {id: 1, title: 'first'},
    ];
    const mockUser = EmberObject.create({
      schools: resolve(mockSchools),
      school: resolve(EmberObject.create(mockSchools[0]))
    });

    const currentUserMock = Service.extend({
      model: resolve(mockUser)
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
    await settled();
    assert.equal(this.$(form).length, 0, 'the user search form is not present');
    assert.equal(this.$(blocks).length, 0, 'there are no form fields for adding a new user');
    assert.equal(this.$(directorySearchBox).length, 1, 'the directory form search form is present');
  });
});
