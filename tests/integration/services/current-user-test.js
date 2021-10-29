import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { authenticateSession, invalidateSession } from 'ember-simple-auth/test-support';

module('Integration | Service | Current User', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    await authenticateSession({
      // this token de-serializes to object with "user_id:100" property/value
      jwt: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE1MTA5Njg4NDEsImV4cCI6MTUxMDk3MjQ3NiwidXNlcl9pZCI6MTAwLCJqdGkiOiI5YzYxZDdjZS1jZjliLTQxZDgtYjQ5YS0zMWFmNWQ4Y2MzY2UifQ.P1QY8zDSi8IAVaJ0YHX_KzYsIfZP_bvBdocZ9V9JUb0',
    });
  });

  test('currentUserId', function (assert) {
    const subject = this.owner.lookup('service:current-user');
    const userId = subject.currentUserId;
    assert.strictEqual(parseInt(userId, 10), 100);
  });

  test('no token - no currentUserId', async function (assert) {
    assert.expect(1);
    await invalidateSession();
    const subject = this.owner.lookup('service:current-user');
    const userId = subject.currentUserId;
    assert.strictEqual(userId, null);
  });

  test('model', async function (assert) {
    assert.expect(1);
    this.server.create('user', { id: 100 });
    const subject = this.owner.lookup('service:current-user');
    const model = await subject.getModel();
    assert.strictEqual(parseInt(model.id, 10), 100);
  });

  test('no token - no model', async function (assert) {
    assert.expect(1);
    await invalidateSession();
    const subject = this.owner.lookup('service:current-user');
    const model = await subject.getModel();
    assert.strictEqual(model, null);
  });

  test('model only loaded once', async function (assert) {
    assert.expect(2);
    this.server.create('user', { id: 100 });
    let calledAlready = false;

    this.server.get('api/users/:id', (schema, request) => {
      const id = request.params.id;
      assert.strictEqual(parseInt(id, 10), 100);
      assert.notOk(calledAlready);
      calledAlready = true;
      return schema.users.find(id);
    });
    const subject = this.owner.lookup('service:current-user');
    await subject.getModel();
    await subject.getModel();
    await subject.getModel();
    await subject.getModel();
    await subject.getModel();
  });

  test('userRoleTitles', async function (assert) {
    assert.expect(3);
    const roles = this.server.createList('user-role', 2);
    this.server.create('user', { id: 100, roles });

    const subject = this.owner.lookup('service:current-user');
    const titles = await subject.getUserRoleTitles();
    assert.strictEqual(titles.length, 2);
    assert.ok(titles.includes('user role 0'));
    assert.ok(titles.includes('user role 1'));
  });

  test('userIsStudent', async function (assert) {
    assert.expect(1);
    const role = this.server.create('user-role', { title: 'student' });
    this.server.create('user', { id: 100, roles: [role] });
    const subject = this.owner.lookup('service:current-user');
    const isStudent = await subject.getIsStudent();
    assert.ok(isStudent);
  });

  test('not userIsStudent', async function (assert) {
    assert.expect(1);
    this.server.create('user', { id: 100 });
    const subject = this.owner.lookup('service:current-user');
    const isStudent = await subject.getIsStudent();
    assert.notOk(isStudent);
  });

  test('userIsFormerStudent', async function (assert) {
    assert.expect(1);
    const role = this.server.create('user-role', { title: 'FORMeR Student' });
    this.server.create('user', { id: 100, roles: [role] });
    const subject = this.owner.lookup('service:current-user');
    const isFormerStudent = await subject.isFormerStudent();
    assert.ok(isFormerStudent);
  });

  test('not userIsFormerStudent', async function (assert) {
    assert.expect(1);
    this.server.create('user', { id: 100 });
    const subject = this.owner.lookup('service:current-user');
    const isFormerStudent = await subject.isFormerStudent();
    assert.notOk(isFormerStudent);
  });

  test('activeRelatedCoursesInThisYearAndLastYear', async function (assert) {
    assert.expect(10);
    const courses = this.server.createList('course', 2);
    this.server.create('user', {
      id: 100,
      directedCourses: [courses[0]],
      administeredCourses: [courses[1]],
    });

    this.server.get('/api/courses', (schema, { queryParams }) => {
      assert.ok('my' in queryParams);
      assert.strictEqual(queryParams.my, 'true');
      assert.ok('filters[year]' in queryParams);
      assert.ok('filters[locked]' in queryParams);
      assert.ok('filters[archived]' in queryParams);
      assert.strictEqual(queryParams['filters[locked]'], 'false');
      assert.strictEqual(queryParams['filters[archived]'], 'false');
      assert.ok(queryParams['filters[year]'].length, 3);

      return schema.courses.all();
    });
    const subject = this.owner.lookup('service:current-user');
    const activeRelatedCourses = await subject.getActiveRelatedCoursesInThisYearAndLastYear();
    assert.ok(activeRelatedCourses.mapBy('id').includes(courses[0].id));
    assert.ok(activeRelatedCourses.mapBy('id').includes(courses[1].id));
  });
});
