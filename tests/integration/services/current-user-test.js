/*eslint ember/avoid-leaking-state-in-ember-objects: 0*/
import EmberObject from '@ember/object';
import { run } from '@ember/runloop';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import RSVP from 'rsvp';

const { resolve } = RSVP;

module('CurrentUserService', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    const session = this.owner.lookup('service:session');
    session.reopen({
      data: {
        authenticated: {
          // this token de-serializes to object with "user_id:100" property/value
          jwt: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE1MTA5Njg4NDEsImV4cCI6MTUxMDk3MjQ3NiwidXNlcl9pZCI6MTAwLCJqdGkiOiI5YzYxZDdjZS1jZjliLTQxZDgtYjQ5YS0zMWFmNWQ4Y2MzY2UifQ.P1QY8zDSi8IAVaJ0YHX_KzYsIfZP_bvBdocZ9V9JUb0"
        }
      }
    });
    this.session = this.owner.lookup('service:session');
    this.store = this.owner.lookup('service:store');
  });

  test('currentUserId', function(assert) {
    const subject = this.owner.lookup('service:current-user');
    const userId = subject.get('currentUserId');
    assert.equal(userId, 100);
  });

  test('no token - no currentUserId', function(assert) {
    assert.expect(1);
    this.session.reopen({
      data: {
        authenticated: {
          jwt: null
        }
      }
    });
    const subject = this.owner.lookup('service:current-user');
    const userId = subject.get('currentUserId');
    assert.equal(userId, null);
  });


  test('model', async function(assert) {
    assert.expect(3);
    const user = {};
    this.store.reopen({
      async find(what, id) {
        assert.equal(what, 'user');
        assert.equal(id, 100);
        return user;
      }
    });
    const subject = this.owner.lookup('service:current-user');
    const model = await subject.get('model');
    assert.equal(model, user);
  });

  test('no token - no model', async function(assert) {
    assert.expect(1);
    const subject = this.owner.lookup('service:current-user');
    this.session.reopen({
      data: {
        authenticated: {
          jwt: null
        }
      }
    });
    const model = await subject.get('model');
    assert.equal(model, null);
  });

  test('userRoleTitles', async function(assert){
    assert.expect(3);
    const user = EmberObject.create({
      roles: resolve([ EmberObject.create({ title: 'foo' }), EmberObject.create({ title: 'BAR' })])
    });
    this.store.reopen({
      async find() {
        return user;
      }
    });
    const subject = this.owner.lookup('service:current-user');
    const titles = await subject.get('userRoleTitles');
    assert.equal(titles.length, 2);
    assert.ok(titles.includes('foo'));
    assert.ok(titles.includes('bar'));
  });

  test('userIsStudent', async function(assert) {
    assert.expect(1);
    const user = EmberObject.create({
      roles: resolve([ EmberObject.create({ title: 'student' }) ])
    });
    this.store.reopen({
      async find() {
        return user;
      }
    });
    const subject = this.owner.lookup('service:current-user');
    const isStudent = await subject.get('userIsStudent');
    assert.ok(isStudent);
  });

  test('not userIsStudent', async function(assert) {
    assert.expect(1);
    const user = EmberObject.create({
      roles: resolve([])
    });
    this.store.reopen({
      async find() {
        return user;
      }
    });
    const subject = this.owner.lookup('service:current-user');
    const isStudent = await subject.get('userIsStudent');
    assert.notOk(isStudent);
  });

  test('userIsFormerStudent', async function(assert) {
    assert.expect(1);
    const user = EmberObject.create({
      roles: resolve([ EmberObject.create({ title: 'FORMeR Student' }) ])
    });
    this.store.reopen({
      async find() {
        return user;
      }
    });
    const subject = this.owner.lookup('service:current-user');
    const isFormerStudent = await subject.get('userIsFormerStudent');
    assert.ok(isFormerStudent);
  });

  test('not userIsFormerStudent', async function(assert) {
    assert.expect(1);
    const user = EmberObject.create({
      roles: resolve([])
    });
    this.store.reopen({
      async find() {
        return user;
      }
    });
    const subject = this.owner.lookup('service:current-user');
    const isFormerStudent = await subject.get('userIsFormerStudent');
    assert.notOk(isFormerStudent);
  });

  test('activeRelatedCoursesInThisYearAndLastYear', async function(assert){
    assert.expect(8);
    const user = EmberObject.create();
    const courses = [ EmberObject.create(), EmberObject.create() ];
    this.store.reopen({
      async find() {
        return user;
      },
      query(what, params) {
        assert.equal(what, 'course');
        assert.equal(params.my, true);
        const filters = params.filters;
        assert.equal(filters.year.length, 3);
        assert.equal(filters.locked, false);
        assert.equal(filters.archived, false);
        assert.equal(filters.year[0] + 1, filters.year[1]);
        assert.equal(filters.year[1] + 1, filters.year[2]);
        return resolve(courses);
      }
    });
    const subject = this.owner.lookup('service:current-user');
    run( async () => {
      const activeRelatedCourses = await subject.get('activeRelatedCoursesInThisYearAndLastYear');
      assert.equal(activeRelatedCourses, courses);
    });
  });
});
