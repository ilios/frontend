import Service from '@ember/service';
import EmberObject from '@ember/object';
import RSVP from 'rsvp';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled, click, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import initializer from "ilios/instance-initializers/ember-i18n";

const { resolve } = RSVP;

const mockSchools = [
  {id: 2, title: 'second', cohorts: resolve([])},
  {id: 1, title: 'first', cohorts: resolve([])},
  {id: 3, title: 'third', cohorts: resolve([])},
];
const mockUser = EmberObject.create({
  schools: resolve(mockSchools),
  school: resolve(EmberObject.create(mockSchools[0]))
});

const currentUserMock = Service.extend({
  model: resolve(mockUser)
});

module('Integration | Component | new directory user', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    this.setup = function() {
      initializer.initialize(this);
    };
  });

  hooks.beforeEach(function() {
    this.owner.register('service:current-user', currentUserMock);
    this['current-user'] = this.owner.lookup('service:current-user');
  });

  test('it renders', async function(assert) {

    let storeMock = Service.extend({
      query(what, {filters}){

        assert.equal('cohort', what);
        assert.equal(filters.schools[0], 2);
        return resolve([]);
      }
    });
    this.owner.register('service:store', storeMock);
    this.set('nothing', () => {});

    await render(hbs`{{new-directory-user close=(action nothing) setSearchTerms=(action nothing)}}`);

    return settled().then(() => {
      let content = find('*').textContent.trim();
      assert.notEqual(content.search(/Search directory for new users/), -1);
    });
  });

  test('input into the search field fires action', async function(assert) {
    assert.expect(1);
    let storeMock = Service.extend({
      query(){
        return resolve([]);
      },
    });
    this.owner.register('service:store', storeMock);
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
    this.$(searchInput).val(searchTerm).trigger('input');

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
    let storeMock = Service.extend({
      query(){
        return resolve([]);
      },
    });
    this.owner.register('service:store', storeMock);
    this.set('nothing', parseInt);
    this.set('startingSearchTerms', startingSearchTerms);
    await render(
      hbs`{{new-directory-user close=(action nothing) setSearchTerms=(action nothing) searchTerms=startingSearchTerms}}`
    );
    const searchBox = '.new-directory-user-search-tools';
    const searchInput = `${searchBox} input`;
    assert.equal(this.$(searchInput).val(), startingSearchTerms, 'passed value is in the box');

  });

  test('create new user', async function(assert) {
    assert.expect(42);
    let facultyRole = EmberObject.create({
      id: 3,
      title: 'Faculty'
    });
    let studentRole = EmberObject.create({
      id: 4,
      title: 'Student'
    });
    let user1 = EmberObject.create({
      firstName: 'user1-first',
      lastName: 'user1-last',
      campusId: 'user1-campus',
      email: 'user1@test.com',
      telephoneNumber: 'user11234',
      user: null,
      username: 'user1-username',
    });
    let user2 = EmberObject.create({
      firstName: 'user2-first',
      lastName: 'user2-last',
      campusId: 'user2-campus',
      email: 'user2@test.com',
      telephoneNumber: 'user21234',
      user: 4136,
      username: 'user2-username',
    });
    let user3 = EmberObject.create({
      firstName: 'user3-first',
      lastName: 'user3-last',
      campusId: null,
      email: null,
      telephoneNumber: 'user31234',
      user: null,
      username: null,
    });
    let ajaxRequestCalled = 0;

    let ajaxMock = Service.extend({
      request(url){
        ajaxRequestCalled++;
        if (ajaxRequestCalled === 1){
          assert.equal(url.trim(), '/application/directory/search?limit=51&searchTerms=searchterm', 'search for user request is correct');
          return resolve({
            results: [user1, user2, user3]
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
    let createRecordCalled = 0;
    let storeMock = Service.extend({
      query(what, {filters}){
        assert.equal('cohort', what, 'looking for a cohort');
        assert.equal(filters.schools[0], 2, 'for school 2');
        return resolve([]);
      },
      findAll(what){
        assert.equal(what, 'user-role', 'looking for user roles');
        return resolve([facultyRole, studentRole]);
      },
      createRecord(what, properties){
        createRecordCalled++;

        if (createRecordCalled === 1) {
          const {firstName, middleName, lastName, campusId, otherId, phone, email} = properties;
          assert.equal(what, 'user', 'creating a user record');
          assert.equal(firstName, user1.get('firstName'), 'record created with correct value for firstName');
          assert.equal(middleName, null, 'record created with correct value for middleName');
          assert.equal(lastName, user1.get('lastName'), 'record created with correct value for lastName');
          assert.equal(campusId, user1.get('campusId'), 'record created with correct value for campusId');
          assert.equal(otherId, null, 'record created with correct value for otherId');
          assert.equal(phone, user1.get('telephoneNumber'), 'record created with correct value for phone');
          assert.equal(email, user1.get('email'), 'record created with correct value for email');

          return new EmberObject({
            save(){
              const roles = this.get('roles');
              assert.equal(roles.length, 1, 'Only one new role was added');
              assert.ok(roles.includes(facultyRole), 'The faculty role was added');
              assert.ok(true, 'save gets called');

              return EmberObject.create({
                id: '13'
              });
            }
          });
        }

        if (createRecordCalled === 2) {
          const {user, username, password} = properties;
          assert.equal(what, 'authentication', 'creating an authentication record');
          assert.equal(username, user1.get('username'), 'record has correct username');
          assert.equal(password, null, 'record has no password');
          assert.equal(user.get('id'), '13', 'we are linking to the expected user');

          return new EmberObject({
            save(){
              assert.ok(true, 'save gets called');
            }
          });
        }

        assert.ok(false, 'create record called too many times');

      },
    });
    this.owner.register('service:store', storeMock);
    let flashmessagesMock = Service.extend({
      success(message){
        assert.equal(message, 'general.saved', 'we display a saved message');
      }
    });
    this.owner.register('service:flashMessages', flashmessagesMock);

    this.set('nothing', parseInt);
    this.set('transitionToUser', (userId)=>{
      assert.equal(userId, 13, 'after saving we transition to the right user');
    });
    await render(hbs`{{new-directory-user
      close=(action nothing)
      setSearchTerms=(action nothing)
      transitionToUser=(action transitionToUser)
      searchTerms='searchterm'
    }}`);

    const results = '.new-directory-user-search-results';
    const firstResultValues = `${results} tbody tr:eq(0) td`;
    const secondResultValues = `${results} tbody tr:eq(1) td`;
    const thirdResultValues = `${results} tbody tr:eq(2) td`;
    const firstIcon = `${firstResultValues}:eq(0) i`;
    const secondIcon = `${secondResultValues}:eq(0) i`;
    const thirdIcon = `${thirdResultValues}:eq(0) i`;

    const firstName = '.item:eq(0) span';
    const lastName = '.item:eq(1) span';
    const campusId = '.item:eq(2) span';
    const email = '.item:eq(3) span';
    const phone = '.item:eq(4) span';
    const otherId = '.item:eq(5) span';
    const username = '.item:eq(6) span';

    const save = '.done';

    return settled().then(()=>{
      assert.ok(this.$(firstIcon).hasClass('fa-plus'), 'this user can be added');
      assert.equal(this.$(firstResultValues).eq(1).text().trim(), user1.get('firstName') + ' ' + user1.get('lastName'), 'correct display for name');
      assert.equal(this.$(firstResultValues).eq(2).text().trim(), user1.get('campusId'), 'correct display for campusId');
      assert.equal(this.$(firstResultValues).eq(3).text().trim(), user1.get('email'), 'correct display for email');

      assert.ok(this.$(secondIcon).hasClass('fa-sun-o'), 'correct display for things');
      assert.equal(this.$(secondResultValues).eq(1).text().trim(), user2.get('firstName') + ' ' + user2.get('lastName'), 'correct display for name');
      assert.equal(this.$(secondResultValues).eq(2).text().trim(), user2.get('campusId'), 'correct display for campusId');
      assert.equal(this.$(secondResultValues).eq(3).text().trim(), user2.get('email'), 'correct display for email');

      assert.ok(this.$(thirdIcon).hasClass('fa-ambulance'), 'correct display for things');
      assert.equal(this.$(thirdResultValues).eq(1).text().trim(), user3.get('firstName') + ' ' + user3.get('lastName'), 'correct display for name');
      assert.equal(this.$(thirdResultValues).eq(2).text().trim(), '', 'campus id is empty');
      assert.equal(this.$(thirdResultValues).eq(3).text().trim(), '', 'email is empty');

      this.$(firstIcon).click();

      return settled().then(async () => {
        assert.equal(this.$(firstName).text().trim(), user1.get('firstName'), 'firstName is correct in form');
        assert.equal(this.$(lastName).text().trim(), user1.get('lastName'), 'lastName is correct in form');
        assert.equal(this.$(campusId).text().trim(), user1.get('campusId'), 'campusId is correct in form');
        assert.equal(this.$(email).text().trim(), user1.get('email'), 'email is correct in form');
        assert.equal(this.$(phone).text().trim(), user1.get('telephoneNumber'), 'phone is correct in form');
        assert.equal(this.$(otherId).text().trim(), '', 'otherId is blank in form');
        assert.equal(this.$(username).text().trim(), user1.get('username'), 'username is correct in form');

        await click(save);

        return settled();
      });

    });
  });
});
