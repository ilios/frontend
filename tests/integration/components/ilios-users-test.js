import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

const { RSVP, Service, Object } = Ember;
const { resolve } = RSVP;

import wait from 'ember-test-helpers/wait';

moduleForComponent('ilios-users', 'Integration | Component | ilios users', {
  integration: true
});

test('it renders', function(assert) {
  const title = '.users .title';
  this.render(hbs`{{ilios-users}}`);
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
  this.register('service:store', storeMock);

  const query = '.user-search input';
  const setQuery = (val) => {
    assert.equal(val, 'test');
  };
  this.set('setQuery', setQuery);
  this.render(hbs`{{ilios-users query='nothing' limit=25 offset=25 setQuery=(action setQuery)}}`);
  await wait();

  assert.equal(this.$(query).val().trim(), 'nothing');
  this.$(query).val('test').change();
});

test('add user form renders when configured to', async function(assert) {
  assert.expect(3);
  let storeMock = Service.extend({
    query(){
      return resolve([]);
    }
  });
  this.register('service:store', storeMock);
  const iliosConfigMock = Service.extend({
    userSearchType: resolve('form')
  });
  this.register('service:iliosConfig', iliosConfigMock);
  const mockSchools = [
    {id: 1, title: 'first', cohorts: resolve([])},
  ];
  const mockUser = Object.create({
    schools: resolve(mockSchools),
    school: resolve(Object.create(mockSchools[0]))
  });

  const currentUserMock = Service.extend({
    model: resolve(mockUser)
  });
  this.register('service:currentUser', currentUserMock);

  this.set('nothing', parseInt);
  this.render(hbs`{{ilios-users
    setShowNewUserForm=(action nothing)
    transitionToUser=(action nothing)
    setSearchTerms=(action nothing)
    showNewUserForm=true
  }}`);
  const form = '.new-user-form';
  const blocks = `${form} .item`;
  const directorySearchBox = '.new-directory-user-search-tools';
  await wait();
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
  this.register('service:store', storeMock);
  const iliosConfigMock = Service.extend({
    userSearchType: resolve('ldap')
  });
  this.register('service:iliosConfig', iliosConfigMock);
  const mockSchools = [
    {id: 1, title: 'first'},
  ];
  const mockUser = Object.create({
    schools: resolve(mockSchools),
    school: resolve(Object.create(mockSchools[0]))
  });

  const currentUserMock = Service.extend({
    model: resolve(mockUser)
  });
  this.register('service:currentUser', currentUserMock);

  this.set('nothing', parseInt);
  this.render(hbs`{{ilios-users
    setShowNewUserForm=(action nothing)
    transitionToUser=(action nothing)
    setSearchTerms=(action nothing)
    showNewUserForm=true
  }}`);
  const form = '.new-user-form';
  const blocks = `${form} .item`;
  const directorySearchBox = '.new-directory-user-search-tools';
  await wait();
  assert.equal(this.$(form).length, 0, 'the user search form is not present');
  assert.equal(this.$(blocks).length, 0, 'there are no form fields for adding a new user');
  assert.equal(this.$(directorySearchBox).length, 1, 'the directory form search form is present');
});
