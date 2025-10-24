import { module, test, todo } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupMirage } from 'test-app/tests/test-support/mirage';
import { authenticateSession, invalidateSession } from 'ember-simple-auth/test-support';
import { mapBy } from 'ilios-common/utils/array-helpers';

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
    await invalidateSession();
    const subject = this.owner.lookup('service:current-user');
    const userId = subject.currentUserId;
    assert.strictEqual(userId, null);
  });

  test('model', async function (assert) {
    this.server.create('user', { id: 100 });
    const subject = this.owner.lookup('service:current-user');
    const model = await subject.getModel();
    assert.strictEqual(parseInt(model.id, 10), 100);
  });

  test('no token - no model', async function (assert) {
    await invalidateSession();
    const subject = this.owner.lookup('service:current-user');
    const model = await subject.getModel();
    assert.strictEqual(model, null);
  });

  test('model only loaded once', async function (assert) {
    this.server.create('user', { id: 100 });
    let calledAlready = false;

    this.server.get('api/users/:id', (schema, request) => {
      assert.step('API called');
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
    assert.verifySteps(['API called']);
  });

  test('userRoleTitles', async function (assert) {
    const roles = this.server.createList('user-role', 2);
    this.server.create('user', { id: 100, roles });

    const subject = this.owner.lookup('service:current-user');
    const titles = await subject.getUserRoleTitles();
    assert.strictEqual(titles.length, 2);
    assert.ok(titles.includes('user role 0'));
    assert.ok(titles.includes('user role 1'));
  });

  test('userIsStudent', async function (assert) {
    const role = this.server.create('user-role', { title: 'student' });
    this.server.create('user', { id: 100, roles: [role] });
    const subject = this.owner.lookup('service:current-user');
    const isStudent = await subject.getIsStudent();
    assert.ok(isStudent);
  });

  test('not userIsStudent', async function (assert) {
    this.server.create('user', { id: 100 });
    const subject = this.owner.lookup('service:current-user');
    const isStudent = await subject.getIsStudent();
    assert.notOk(isStudent);
  });

  test('userIsFormerStudent', async function (assert) {
    const role = this.server.create('user-role', { title: 'FORMeR Student' });
    this.server.create('user', { id: 100, roles: [role] });
    const subject = this.owner.lookup('service:current-user');
    const isFormerStudent = await subject.isFormerStudent();
    assert.ok(isFormerStudent);
  });

  test('not userIsFormerStudent', async function (assert) {
    this.server.create('user', { id: 100 });
    const subject = this.owner.lookup('service:current-user');
    const isFormerStudent = await subject.isFormerStudent();
    assert.notOk(isFormerStudent);
  });

  test('activeRelatedCoursesInThisYearAndLastYear', async function (assert) {
    const courses = this.server.createList('course', 2);
    this.server.create('user', {
      id: 100,
      directedCourses: [courses[0]],
      administeredCourses: [courses[1]],
    });

    this.server.get('/api/courses', (schema, { queryParams }) => {
      assert.step('API called');
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
    assert.ok(mapBy(activeRelatedCourses, 'id').includes(courses[0].id));
    assert.ok(mapBy(activeRelatedCourses, 'id').includes(courses[1].id));
    assert.verifySteps(['API called']);
  });

  test('getAllInstructedSessions', async function (assert) {
    const user = this.server.create('user', { id: 100 });
    const subject = this.owner.lookup('service:current-user');
    const sessions = this.server.createList('session', 6);
    const instructorGroups = this.server.createList('instructor-group', 2, { users: [user] });
    const learnerGroups = this.server.createList('learner-group', 2, { instructors: [user] });
    // connect this user as instructor to sessions any way possible.
    this.server.create('offering', {
      session: sessions[0],
      instructorGroups: [instructorGroups[0]],
    });
    this.server.create('offering', { session: sessions[1], instructors: [user] });
    this.server.create('offering', { session: sessions[2], learnerGroups: [learnerGroups[0]] });
    this.server.create('ilm-session', {
      session: sessions[3],
      instructorGroups: [instructorGroups[1]],
    });
    this.server.create('ilm-session', { session: sessions[4], instructors: [user] });
    this.server.create('ilm-session', { session: sessions[5], learnerGroups: [learnerGroups[1]] });
    // do it again, but in a different order. the point is to prove that de-duplication works.
    this.server.create('offering', {
      session: sessions[5],
      instructorGroups: [instructorGroups[0]],
    });
    this.server.create('offering', { session: sessions[4], instructors: [user] });
    this.server.create('offering', { session: sessions[3], learnerGroups: [learnerGroups[0]] });
    this.server.create('ilm-session', {
      session: sessions[2],
      instructorGroups: [instructorGroups[1]],
    });
    this.server.create('ilm-session', { session: sessions[1], instructors: [user] });
    this.server.create('ilm-session', { session: sessions[0], learnerGroups: [learnerGroups[1]] });
    const instructedSessions = await subject.getAllInstructedSessions();
    assert.strictEqual(instructedSessions.length, 6);
    const sessionIds = sessions.map((session) => session.id);
    instructedSessions.forEach((session) => {
      assert.ok(sessionIds.includes(session.id));
    });
  });

  test('getAllInstructedCourses', async function (assert) {
    const user = this.server.create('user', { id: 100 });
    const subject = this.owner.lookup('service:current-user');
    const courses = this.server.createList('course', 6);
    const session1 = this.server.create('session', { course: courses[0] });
    const session2 = this.server.create('session', { course: courses[1] });
    const session3 = this.server.create('session', { course: courses[2] });
    const session4 = this.server.create('session', { course: courses[3] });
    const session5 = this.server.create('session', { course: courses[4] });
    const session6 = this.server.create('session', { course: courses[5] });
    const session7 = this.server.create('session', { course: courses[0] });
    const session8 = this.server.create('session', { course: courses[1] });
    const session9 = this.server.create('session', { course: courses[2] });
    const session10 = this.server.create('session', { course: courses[3] });
    const session11 = this.server.create('session', { course: courses[4] });
    const session12 = this.server.create('session', { course: courses[5] });

    const instructorGroups = this.server.createList('instructor-group', 2, { users: [user] });
    const learnerGroups = this.server.createList('learner-group', 2, { instructors: [user] });
    // connect this user as instructor to courses any way possible.
    this.server.create('offering', { session: session1, instructorGroups: [instructorGroups[0]] });
    this.server.create('offering', { session: session2, instructors: [user] });
    this.server.create('offering', { session: session3, learnerGroups: [learnerGroups[0]] });
    this.server.create('ilm-session', {
      session: session4,
      instructorGroups: [instructorGroups[1]],
    });
    this.server.create('ilm-session', { session: session5, instructors: [user] });
    this.server.create('ilm-session', { session: session6, learnerGroups: [learnerGroups[1]] });
    // do it again, but through different sessions. the point is to prove that de-duplication works.
    this.server.create('offering', { session: session7, instructorGroups: [instructorGroups[0]] });
    this.server.create('offering', { session: session8, instructors: [user] });
    this.server.create('offering', { session: session9, learnerGroups: [learnerGroups[0]] });
    this.server.create('ilm-session', {
      session: session10,
      instructorGroups: [instructorGroups[1]],
    });
    this.server.create('ilm-session', { session: session11, instructors: [user] });
    this.server.create('ilm-session', { session: session12, learnerGroups: [learnerGroups[1]] });
    const instructedCourses = await subject.getAllInstructedCourses();
    assert.strictEqual(instructedCourses.length, 6);
    const courseIds = courses.map((course) => course.id);
    instructedCourses.forEach((course) => {
      assert.ok(courseIds.includes(course.id));
    });
  });

  test('isTeachingCourseInSchool', async function (assert) {
    const user = this.server.create('user', { id: 100 });
    const subject = this.owner.lookup('service:current-user');
    const school1 = this.server.create('school');
    const school2 = this.server.create('school');
    const course = this.server.create('course', { school: school1 });
    const session = this.server.create('session', { course });
    this.server.create('offering', { session, instructors: [user] });
    const schoolModel1 = await this.owner.lookup('service:store').findRecord('school', school1.id);
    const schoolModel2 = await this.owner.lookup('service:store').findRecord('school', school2.id);
    const isTeachingCourseInSchool1 = await subject.isTeachingCourseInSchool(schoolModel1);
    const isTeachingCourseInSchool2 = await subject.isTeachingCourseInSchool(schoolModel2);
    assert.ok(isTeachingCourseInSchool1);
    assert.notOk(isTeachingCourseInSchool2);
  });

  test('isTeachingCourse', async function (assert) {
    const user = this.server.create('user', { id: 100 });
    const subject = this.owner.lookup('service:current-user');
    const course1 = this.server.create('course');
    const course2 = this.server.create('course');
    const session = this.server.create('session', { course: course1 });
    this.server.create('offering', { session, instructors: [user] });
    const courseModel1 = await this.owner.lookup('service:store').findRecord('course', course1.id);
    const courseModel2 = await this.owner.lookup('service:store').findRecord('course', course2.id);
    const isTeachingCourse1 = await subject.isTeachingCourse(courseModel1);
    const isTeachingCourse2 = await subject.isTeachingCourse(courseModel2);
    assert.ok(isTeachingCourse1);
    assert.notOk(isTeachingCourse2);
  });

  test('isTeachingSession', async function (assert) {
    const user = this.server.create('user', { id: 100 });
    const subject = this.owner.lookup('service:current-user');
    const session1 = this.server.create('session');
    const session2 = this.server.create('session');
    this.server.create('offering', { session: session1, instructors: [user] });
    const sessionModel1 = await this.owner
      .lookup('service:store')
      .findRecord('session', session1.id);
    const sessionModel2 = await this.owner
      .lookup('service:store')
      .findRecord('session', session2.id);
    const isTeachingSession1 = await subject.isTeachingSession(sessionModel1);
    const isTeachingSession2 = await subject.isTeachingSession(sessionModel2);
    assert.ok(isTeachingSession1);
    assert.notOk(isTeachingSession2);
  });

  todo('requireNonLearner', function (/* assert */) {
    // TODO: implement.
  });
});
