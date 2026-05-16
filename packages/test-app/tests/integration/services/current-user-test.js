import { module, test, skip } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupMSW } from 'ilios-common/msw';
import { authenticateSession, invalidateSession } from 'ember-simple-auth/test-support';
import { mapBy } from 'ilios-common/utils/array-helpers';
import { formatJsonApi } from 'ilios-common/msw/utils/json-api-formatter.js';

module('Integration | Service | Current User', function (hooks) {
  setupTest(hooks);
  setupMSW(hooks);

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
    await this.server.create('user', { id: 100 });
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
    await this.server.create('user', { id: 100 });
    let calledAlready = false;

    this.server.get('/api/users/:id', async ({ params }) => {
      assert.step('API called');
      const id = Number(params.id);
      assert.strictEqual(id, 100);
      assert.notOk(calledAlready);
      calledAlready = true;

      const user = await this.server.db.user.findFirst((q) => q.where({ id }));
      return formatJsonApi(user, 'user');
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
    const roles = await this.server.createList('user-role', 2);
    await this.server.create('user', { id: 100, roles });

    const subject = this.owner.lookup('service:current-user');
    const titles = await subject.getUserRoleTitles();
    assert.strictEqual(titles.length, 2);
    assert.ok(titles.includes('user role 0'));
    assert.ok(titles.includes('user role 1'));
  });

  test('userIsStudent', async function (assert) {
    const role = await this.server.create('user-role', { title: 'student' });
    await this.server.create('user', { id: 100, roles: [role] });
    const subject = this.owner.lookup('service:current-user');
    const isStudent = await subject.getIsStudent();
    assert.ok(isStudent);
  });

  test('not userIsStudent', async function (assert) {
    await this.server.create('user', { id: 100 });
    const subject = this.owner.lookup('service:current-user');
    const isStudent = await subject.getIsStudent();
    assert.notOk(isStudent);
  });

  test('userIsFormerStudent', async function (assert) {
    const role = await this.server.create('user-role', { title: 'FORMeR Student' });
    await this.server.create('user', { id: 100, roles: [role] });
    const subject = this.owner.lookup('service:current-user');
    const isFormerStudent = await subject.isFormerStudent();
    assert.ok(isFormerStudent);
  });

  test('not userIsFormerStudent', async function (assert) {
    await this.server.create('user', { id: 100 });
    const subject = this.owner.lookup('service:current-user');
    const isFormerStudent = await subject.isFormerStudent();
    assert.notOk(isFormerStudent);
  });

  test('activeRelatedCoursesInThisYearAndLastYear', async function (assert) {
    const courses = await this.server.createList('course', 2);
    await this.server.create('user', {
      id: 100,
      directedCourses: [courses[0]],
      administeredCourses: [courses[1]],
    });

    this.server.get('/api/courses', async ({ request }) => {
      const { searchParams } = new URL(request.url);

      assert.strictEqual(searchParams.get('my'), 'true');
      assert.strictEqual(searchParams.get('filters[locked]'), 'false');
      assert.strictEqual(searchParams.get('filters[archived]'), 'false');
      assert.strictEqual(searchParams.getAll('filters[year][]').length, 3);

      assert.step('API called');
      const courses = await this.server.db.course.all();
      return formatJsonApi(courses, 'course');
    });
    const subject = this.owner.lookup('service:current-user');
    const activeRelatedCourses = await subject.getActiveRelatedCoursesInThisYearAndLastYear();
    assert.ok(mapBy(activeRelatedCourses, 'id').map(Number).includes(courses[0].id));
    assert.ok(mapBy(activeRelatedCourses, 'id').map(Number).includes(courses[1].id));
    assert.verifySteps(['API called']);
  });

  test('getAllInstructedSessions', async function (assert) {
    const user = await this.server.create('user', { id: 100 });
    const subject = this.owner.lookup('service:current-user');
    const sessions = await this.server.createList('session', 6);
    const instructorGroups = await this.server.createList('instructor-group', 2, { users: [user] });
    const learnerGroups = await this.server.createList('learner-group', 2, { instructors: [user] });
    // connect this user as instructor to sessions any way possible.
    await this.server.create('offering', {
      session: sessions[0],
      instructorGroups: [instructorGroups[0]],
    });
    await this.server.create('offering', { session: sessions[1], instructors: [user] });
    await this.server.create('offering', {
      session: sessions[2],
      learnerGroups: [learnerGroups[0]],
    });
    await this.server.create('ilm-session', {
      session: sessions[3],
      instructorGroups: [instructorGroups[1]],
    });
    await this.server.create('ilm-session', { session: sessions[4], instructors: [user] });
    await this.server.create('ilm-session', {
      session: sessions[5],
      learnerGroups: [learnerGroups[1]],
    });
    // do it again, but in a different order. the point is to prove that de-duplication works.
    await this.server.create('offering', {
      session: sessions[5],
      instructorGroups: [instructorGroups[0]],
    });
    await this.server.create('offering', { session: sessions[4], instructors: [user] });
    await this.server.create('offering', {
      session: sessions[3],
      learnerGroups: [learnerGroups[0]],
    });
    await this.server.create('ilm-session', {
      session: sessions[2],
      instructorGroups: [instructorGroups[1]],
    });
    await this.server.create('ilm-session', { session: sessions[1], instructors: [user] });
    await this.server.create('ilm-session', {
      session: sessions[0],
      learnerGroups: [learnerGroups[1]],
    });
    const instructedSessions = await subject.getAllInstructedSessions();
    assert.strictEqual(instructedSessions.length, 6);
    const sessionIds = sessions.map((session) => session.id);
    instructedSessions.forEach((session) => {
      assert.ok(sessionIds.includes(Number(session.id)));
    });
  });

  test('getAllInstructedCourses', async function (assert) {
    const user = await this.server.create('user', { id: 100 });
    const subject = this.owner.lookup('service:current-user');
    const courses = await this.server.createList('course', 6);
    const session1 = await this.server.create('session', { course: courses[0] });
    const session2 = await this.server.create('session', { course: courses[1] });
    const session3 = await this.server.create('session', { course: courses[2] });
    const session4 = await this.server.create('session', { course: courses[3] });
    const session5 = await this.server.create('session', { course: courses[4] });
    const session6 = await this.server.create('session', { course: courses[5] });
    const session7 = await this.server.create('session', { course: courses[0] });
    const session8 = await this.server.create('session', { course: courses[1] });
    const session9 = await this.server.create('session', { course: courses[2] });
    const session10 = await this.server.create('session', { course: courses[3] });
    const session11 = await this.server.create('session', { course: courses[4] });
    const session12 = await this.server.create('session', { course: courses[5] });

    const instructorGroups = await this.server.createList('instructor-group', 2, { users: [user] });
    const learnerGroups = await this.server.createList('learner-group', 2, { instructors: [user] });
    // connect this user as instructor to courses any way possible.
    await this.server.create('offering', {
      session: session1,
      instructorGroups: [instructorGroups[0]],
    });
    await this.server.create('offering', { session: session2, instructors: [user] });
    await this.server.create('offering', { session: session3, learnerGroups: [learnerGroups[0]] });
    await this.server.create('ilm-session', {
      session: session4,
      instructorGroups: [instructorGroups[1]],
    });
    await this.server.create('ilm-session', { session: session5, instructors: [user] });
    await this.server.create('ilm-session', {
      session: session6,
      learnerGroups: [learnerGroups[1]],
    });
    // do it again, but through different sessions. the point is to prove that de-duplication works.
    await this.server.create('offering', {
      session: session7,
      instructorGroups: [instructorGroups[0]],
    });
    await this.server.create('offering', { session: session8, instructors: [user] });
    await this.server.create('offering', { session: session9, learnerGroups: [learnerGroups[0]] });
    await this.server.create('ilm-session', {
      session: session10,
      instructorGroups: [instructorGroups[1]],
    });
    await this.server.create('ilm-session', { session: session11, instructors: [user] });
    await this.server.create('ilm-session', {
      session: session12,
      learnerGroups: [learnerGroups[1]],
    });
    const instructedCourses = await subject.getAllInstructedCourses();
    assert.strictEqual(instructedCourses.length, 6);
    const courseIds = courses.map((course) => course.id);
    instructedCourses.forEach((course) => {
      assert.ok(courseIds.includes(Number(course.id)));
    });
  });

  test('isTeachingCourseInSchool', async function (assert) {
    const user = await this.server.create('user', { id: 100 });
    const subject = this.owner.lookup('service:current-user');
    const school1 = await this.server.create('school');
    const school2 = await this.server.create('school');
    const course = await this.server.create('course', { school: school1 });
    const session = await this.server.create('session', { course });
    await this.server.create('offering', { session, instructors: [user] });
    const schoolModel1 = await this.owner.lookup('service:store').findRecord('school', school1.id);
    const schoolModel2 = await this.owner.lookup('service:store').findRecord('school', school2.id);
    const isTeachingCourseInSchool1 = await subject.isTeachingCourseInSchool(schoolModel1);
    const isTeachingCourseInSchool2 = await subject.isTeachingCourseInSchool(schoolModel2);
    assert.ok(isTeachingCourseInSchool1);
    assert.notOk(isTeachingCourseInSchool2);
  });

  test('isTeachingCourse', async function (assert) {
    const user = await this.server.create('user', { id: 100 });
    const subject = this.owner.lookup('service:current-user');
    const course1 = await this.server.create('course');
    const course2 = await this.server.create('course');
    const session = await this.server.create('session', { course: course1 });
    await this.server.create('offering', { session, instructors: [user] });
    const courseModel1 = await this.owner.lookup('service:store').findRecord('course', course1.id);
    const courseModel2 = await this.owner.lookup('service:store').findRecord('course', course2.id);
    const isTeachingCourse1 = await subject.isTeachingCourse(courseModel1);
    const isTeachingCourse2 = await subject.isTeachingCourse(courseModel2);
    assert.ok(isTeachingCourse1);
    assert.notOk(isTeachingCourse2);
  });

  test('isTeachingSession', async function (assert) {
    const user = await this.server.create('user', { id: 100 });
    const subject = this.owner.lookup('service:current-user');
    const session1 = await this.server.create('session');
    const session2 = await this.server.create('session');
    await this.server.create('offering', { session: session1, instructors: [user] });
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

  skip('requireNonLearner', function (/* assert */) {
    // TODO: implement.
  });
});
