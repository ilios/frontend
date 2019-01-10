import Service from '@ember/service';
import EmberObject from '@ember/object';
import { resolve } from 'rsvp';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import {
  render,
  click,
  findAll,
  fillIn
} from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { run } from '@ember/runloop';

const permissionCheckerMock = Service.extend({
  async canCreateUser() {
    return resolve(true);
  }
});

module('Integration | Component | new directory user', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const schools = this.server.createList('school', 3);
    const user = this.server.create('user', {
      school: schools[0]
    });
    const userModel = await run(() => this.owner.lookup('service:store').find('user', user.id));
    const currentUserMock = Service.extend({
      model: resolve(userModel)
    });

    this.owner.register('service:current-user', currentUserMock);
    this['current-user'] = this.owner.lookup('service:current-user');
    this.owner.register('service:permissionChecker', permissionCheckerMock);
  });

  test('it renders', async function(assert) {
    this.set('nothing', () => {});

    await render(hbs`{{new-directory-user close=(action nothing) setSearchTerms=(action nothing)}}`);
    assert.ok(this.element.textContent.includes('Search directory for new users'));
  });

  test('input into the search field fires action', async function(assert) {
    assert.expect(1);
    const searchTerm = 'search for me!';
    this.set('nothing', parseInt);
    this.set('setSearchTerms', (val)=>{
      assert.equal(val, searchTerm, 'changes to search get sent as action');
    });
    await render(
      hbs`{{new-directory-user close=(action nothing) setSearchTerms=(action setSearchTerms) searchTerms=startingSearchTerms}}`
    );
    const searchBox = '.new-directory-user-search-tools';
    const searchInput = `${searchBox} input`;
    await fillIn(searchInput, searchTerm);
  });

  test('initial search input fires search and fills input', async function(assert) {
    assert.expect(2);
    const startingSearchTerms = 'start here';

    let ajaxMock = Service.extend({
      request(url){
        assert.equal(url.trim(), `/application/directory/search?limit=51&searchTerms=${startingSearchTerms}`);
        return resolve({
          results: []
        });
      }
    });
    this.owner.register('service:commonAjax', ajaxMock);
    this.set('nothing', parseInt);
    this.set('startingSearchTerms', startingSearchTerms);
    await render(
      hbs`{{new-directory-user close=(action nothing) setSearchTerms=(action nothing) searchTerms=startingSearchTerms}}`
    );
    const searchBox = '.new-directory-user-search-tools';
    const searchInput = `${searchBox} input`;
    assert.dom(searchInput).hasValue(startingSearchTerms, 'passed value is in the box');

  });

  test('create new user', async function(assert) {
    assert.expect(32);
    this.server.create('user-role', {
      id: 4,
      title: 'Student'
    });
    const user1Object = EmberObject.create({
      firstName: 'user1-first',
      lastName: 'user1-last',
      campusId: 'user1-campus',
      email: 'user1@test.com',
      telephoneNumber: 'user11234',
      user: null,
      username: 'user1-username',
    });
    const user2Object = EmberObject.create({
      firstName: 'user2-first',
      lastName: 'user2-last',
      campusId: 'user2-campus',
      email: 'user2@test.com',
      telephoneNumber: 'user21234',
      user: 4136,
      username: 'user2-username',
    });
    const user3Object = EmberObject.create({
      firstName: 'user3-first',
      lastName: 'user3-last',
      campusId: null,
      email: null,
      telephoneNumber: 'user31234',
      user: null,
      username: null,
    });
    this.server.create('user', user1Object.getProperties('firstName', 'lastName', 'campusId', 'email', 'telephoneNumber'));
    const user2 = this.server.create('user', user2Object.getProperties('firstName', 'lastName', 'campusId', 'email', 'telephoneNumber'));
    this.server.create('authentication', {
      user: user2,
      username: user2Object.username,
    });
    this.server.create('user', user3Object.getProperties('firstName', 'lastName', 'campusId', 'email', 'telephoneNumber'));
    let ajaxRequestCalled = 0;

    const ajaxMock = Service.extend({
      request(url){
        ajaxRequestCalled++;
        if (ajaxRequestCalled === 1){
          assert.equal(url.trim(), '/application/directory/search?limit=51&searchTerms=searchterm', 'search for user request is correct');
          return resolve({
            results: [user1Object, user2Object, user3Object]
          });
        }
        if (ajaxRequestCalled === 2){
          assert.equal(url.trim(), '/application/config', 'config request is correct');
          return resolve({config: {
            locale: 'en',
            type: 'ladp',
            userSearchType: 'ldap',
          }});
        }

      }
    });
    this.owner.register('service:commonAjax', ajaxMock);

    this.set('nothing', parseInt);
    this.set('transitionToUser', (userId)=>{
      assert.equal(userId, 5, 'after saving we transition to the right user');
    });
    await render(hbs`{{new-directory-user
      close=(action nothing)
      setSearchTerms=(action nothing)
      transitionToUser=(action transitionToUser)
      searchTerms='searchterm'
    }}`);

    const results = '.new-directory-user-search-results';
    const firstResultValues = `${results} tbody tr:nth-of-type(1) td`;
    const secondResultValues = `${results} tbody tr:nth-of-type(2) td`;
    const thirdResultValues = `${results} tbody tr:nth-of-type(3) td`;
    const firstIcon = `${firstResultValues}:nth-of-type(1) svg`;
    const secondIcon = `${secondResultValues}:nth-of-type(1) svg`;
    const thirdIcon = `${thirdResultValues}:nth-of-type(1) svg`;

    const firstName = '[data-test-first-name] span';
    const lastName = '[data-test-last-name] span';
    const campusId = '[data-test-campus-id] span';
    const email = '[data-test-email] span';
    const phone = '[data-test-phone] span';
    const otherId = '[data-test-other-id] input';
    const username = '[data-test-username] span';

    const save = '.done';

    assert.dom(firstIcon).hasClass('fa-plus', 'this user can be added');
    assert.dom(findAll(firstResultValues)[1]).hasText(
      user1Object.get('firstName') + ' ' + user1Object.get('lastName'),
      'correct display for name'
    );
    assert.dom(findAll(firstResultValues)[2]).hasText(user1Object.get('campusId'), 'correct display for campusId');
    assert.dom(findAll(firstResultValues)[3]).hasText(user1Object.get('email'), 'correct display for email');

    assert.dom(secondIcon).hasClass('fa-sun', 'correct display for things');
    assert.dom(findAll(secondResultValues)[1]).hasText(
      user2Object.get('firstName') + ' ' + user2Object.get('lastName'),
      'correct display for name'
    );
    assert.dom(findAll(secondResultValues)[2]).hasText(user2Object.get('campusId'), 'correct display for campusId');
    assert.dom(findAll(secondResultValues)[3]).hasText(user2Object.get('email'), 'correct display for email');

    assert.dom(thirdIcon).hasClass('fa-ambulance', 'correct display for things');
    assert.dom(findAll(thirdResultValues)[1]).hasText(
      user3Object.get('firstName') + ' ' + user3Object.get('lastName'),
      'correct display for name'
    );
    assert.dom(findAll(thirdResultValues)[2]).hasText('', 'campus id is empty');
    assert.dom(findAll(thirdResultValues)[3]).hasText('', 'email is empty');

    await click(firstIcon);

    assert.dom(firstName).hasText(user1Object.get('firstName'), 'firstName is correct in form');
    assert.dom(lastName).hasText(user1Object.get('lastName'), 'lastName is correct in form');
    assert.dom(campusId).hasText(user1Object.get('campusId'), 'campusId is correct in form');
    assert.dom(email).hasText(user1Object.get('email'), 'email is correct in form');
    assert.dom(phone).hasText(user1Object.get('telephoneNumber'), 'phone is correct in form');
    assert.dom(otherId).hasText('', 'otherId is blank in form');
    assert.dom(username).hasText(user1Object.get('username'), 'username is correct in form');

    await click(save);

    const userModel = await run(() => this.owner.lookup('service:store').find('user', 5));
    assert.equal(userModel.firstName, user1Object.get('firstName'), 'record created with correct value for firstName');
    assert.equal(userModel.middleName, null, 'record created with correct value for middleName');
    assert.equal(userModel.lastName, user1Object.get('lastName'), 'record created with correct value for lastName');
    assert.equal(userModel.campusId, user1Object.get('campusId'), 'record created with correct value for campusId');
    assert.equal(userModel.otherId, null, 'record created with correct value for otherId');
    assert.equal(userModel.phone, user1Object.get('telephoneNumber'), 'record created with correct value for phone');
    assert.equal(userModel.email, user1Object.get('email'), 'record created with correct value for email');

    const authenticationModel = await userModel.get('authentication');
    assert.equal(authenticationModel.username, user1Object.get('username'), 'record has correct username');
    assert.equal(authenticationModel.password, null, 'record has no password');
    assert.equal(authenticationModel.user.get('id'), '5', 'we are linking to the expected user');
  });
});
