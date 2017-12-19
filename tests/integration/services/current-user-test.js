/*eslint ember/avoid-leaking-state-in-ember-objects: 0*/
import { getOwner } from '@ember/application';
import EmberObject from '@ember/object';
import { run } from '@ember/runloop';
import { moduleFor, test } from 'ember-qunit';
import RSVP from 'rsvp';

const { resolve } = RSVP;

moduleFor('service:current-user', 'CurrentUserService', {
  integration: true,

  beforeEach() {
    const session = getOwner(this).lookup('service:session');
    session.reopen({
      data: {
        authenticated: {
          // this token de-serializes to object with "user_id:100" property/value
          jwt: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE1MTA5Njg4NDEsImV4cCI6MTUxMDk3MjQ3NiwidXNlcl9pZCI6MTAwLCJqdGkiOiI5YzYxZDdjZS1jZjliLTQxZDgtYjQ5YS0zMWFmNWQ4Y2MzY2UifQ.P1QY8zDSi8IAVaJ0YHX_KzYsIfZP_bvBdocZ9V9JUb0"
        }
      }
    });
    this.inject.service('session', { as: 'session' });
    this.inject.service('store', { as: 'store' });
  }
});

test('currentUserId', function(assert) {
  const subject = this.subject();
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
  const subject = this.subject();
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
  const subject = this.subject();
  const model = await subject.get('model');
  assert.equal(model, user);
});

test('no token - no model', async function(assert) {
  assert.expect(1);
  const subject = this.subject();
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

test('cohortsInAllAssociatedSchools', async function(assert){
  assert.expect(4);
  const cohort1 = EmberObject.create();
  const cohort2 = EmberObject.create();
  const cohort3 = EmberObject.create();
  const program1 = EmberObject.create({
    cohorts: resolve([ cohort1, cohort2 ])
  });
  const program2 = EmberObject.create({
    cohorts: resolve([])
  });
  const program3 = EmberObject.create({
    cohorts: resolve([ cohort3 ])
  });
  const school1 = EmberObject.create({
    programs: resolve([ program1, program2 ])
  });
  const school2 = EmberObject.create({
    programs: resolve([ program3 ])
  });
  const user = EmberObject.create({
    schools: resolve([school1, school2 ])
  });

  this.store.reopen({
    async find() {
      return user;
    }
  });

  const subject = this.subject();
  const cohorts = await subject.get('cohortsInAllAssociatedSchools');
  assert.equal(cohorts.length, 3);
  assert.ok(cohorts.includes(cohort1));
  assert.ok(cohorts.includes(cohort2));
  assert.ok(cohorts.includes(cohort3));
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
  const subject = this.subject();
  const titles = await subject.get('userRoleTitles');
  assert.equal(titles.length, 2);
  assert.ok(titles.includes('foo'));
  assert.ok(titles.includes('bar'));
});

test('userIsCourseDirector', async function(assert) {
  assert.expect(1);
  const user = EmberObject.create({
    roles: resolve([ EmberObject.create({ title: 'Course Director' }) ])
  });
  this.store.reopen({
    async find() {
      return user;
    }
  });
  const subject = this.subject();
  const isDirector = await subject.get('userIsCourseDirector');
  assert.ok(isDirector);
});

test('not userIsCourseDirector', async function(assert) {
  assert.expect(1);
  const user = EmberObject.create({
    roles: resolve([ EmberObject.create({ title: 'Pie Eating Champion' }) ])
  });
  this.store.reopen({
    async find() {
      return user;
    }
  });
  const subject = this.subject();
  const isDirector = await subject.get('userIsCourseDirector');
  assert.notOk(isDirector);
});

test('userIsFaculty', async function(assert) {
  assert.expect(1);
  const user = EmberObject.create({
    roles: resolve([ EmberObject.create({ title: 'faculty' }) ])
  });
  this.store.reopen({
    async find() {
      return user;
    }
  });
  const subject = this.subject();
  const isFaculty = await subject.get('userIsFaculty');
  assert.ok(isFaculty);
});

test('not userIsFaculty', async function(assert) {
  assert.expect(1);
  const user = EmberObject.create({
    roles: resolve([])
  });
  this.store.reopen({
    async find() {
      return user;
    }
  });
  const subject = this.subject();
  const isFaculty = await subject.get('userIsFaculty');
  assert.notOk(isFaculty);
});

test('userIsDeveloper', async function(assert) {
  assert.expect(1);
  const user = EmberObject.create({
    roles: resolve([ EmberObject.create({ title: 'developer' }) ])
  });
  this.store.reopen({
    async find() {
      return user;
    }
  });
  const subject = this.subject();
  const isDeveloper = await subject.get('userIsDeveloper');
  assert.ok(isDeveloper);
});

test('not userIsDeveloper', async function(assert) {
  assert.expect(1);
  const user = EmberObject.create({
    roles: resolve([])
  });
  this.store.reopen({
    async find() {
      return user;
    }
  });
  const subject = this.subject();
  const isDeveloper = await subject.get('userIsDeveloper');
  assert.notOk(isDeveloper);
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
  const subject = this.subject();
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
  const subject = this.subject();
  const isStudent = await subject.get('userIsStudent');
  assert.notOk(isStudent);
});

test('userIsPublic', async function(assert) {
  assert.expect(1);
  const user = EmberObject.create({
    roles: resolve([ EmberObject.create({ title: 'public' }) ])
  });
  this.store.reopen({
    async find() {
      return user;
    }
  });
  const subject = this.subject();
  const isPublic = await subject.get('userIsPublic');
  assert.ok(isPublic);
});

test('not userIsPublic', async function(assert) {
  assert.expect(1);
  const user = EmberObject.create({
    roles: resolve([])
  });
  this.store.reopen({
    async find() {
      return user;
    }
  });
  const subject = this.subject();
  const isPublic = await subject.get('userIsPublic');
  assert.notOk(isPublic);
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
  const subject = this.subject();
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
  const subject = this.subject();
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
  const subject = this.subject();
  run( async () => {
    const activeRelatedCourses = await subject.get('activeRelatedCoursesInThisYearAndLastYear');
    assert.equal(activeRelatedCourses, courses);
  });
});
