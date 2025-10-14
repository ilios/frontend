import { currentRouteName, visit } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupAuthentication } from 'ilios-common';
import { setupApplicationTest } from 'frontend/tests/helpers';

module('Acceptance | performance', function (hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(async function () {
    this.set('durationQuick', 1000);
    this.set('durationModerate', 2000);

    this.school = this.server.create('school');
    this.user = await setupAuthentication({ school: this.school }, true);
  });

  test('/dashboard/week', async function (assert) {
    let start = performance.now();

    await visit('/dashboard/week');

    let end = performance.now();
    let duration = end - start;

    assert.strictEqual(currentRouteName(), 'dashboard.week', 'current route name is correct');
    assert.ok(
      duration < this.durationQuick,
      `Render time was ${duration}ms`,
      `route loaded in allowable time: ${duration}`,
    );
  });

  test('/dashboard/materials', async function (assert) {
    let start = performance.now();

    await visit('/dashboard/materials');

    let end = performance.now();
    let duration = end - start;

    assert.strictEqual(currentRouteName(), 'dashboard.materials', 'current route name is correct');
    assert.ok(
      duration < this.durationQuick,
      `Render time was ${duration}ms`,
      `route loaded in allowable time: ${duration}`,
    );
  });

  test('/dashboard/calendar', async function (assert) {
    let start = performance.now();

    await visit('/dashboard/calendar');

    let end = performance.now();
    let duration = end - start;

    assert.strictEqual(currentRouteName(), 'dashboard.calendar', 'current route name is correct');
    assert.ok(
      duration < this.durationQuick,
      `Render time was ${duration}ms`,
      `route loaded in allowable time: ${duration}`,
    );
  });

  test('/weeklyevents', async function (assert) {
    let start = performance.now();

    await visit('/weeklyevents');

    let end = performance.now();
    let duration = end - start;

    assert.strictEqual(currentRouteName(), 'weeklyevents', 'current route name is correct');
    assert.ok(
      duration < this.durationQuick,
      `Render time was ${duration}ms`,
      `route loaded in allowable time: ${duration}`,
    );
  });

  test('/courses', async function (assert) {
    this.server.create('academic-year');
    this.sessionTypes = this.server.createList('session-type', 1, {
      school: this.school,
    });

    for (let i = 0; i < 100; i++) {
      this.server.create('course', {
        school: this.school,
      });
    }

    let start = performance.now();

    await visit('/courses');

    let end = performance.now();
    let duration = end - start;

    assert.strictEqual(currentRouteName(), 'courses', 'current route name is correct');
    assert.ok(
      duration < this.durationModerate,
      `Render time was ${duration}ms`,
      `route loaded in allowable: ${duration}`,
    );
  });

  test('/courses/[course-id]/sessions', async function (assert) {
    this.server.create('academic-year');
    this.sessionTypes = this.server.createList('session-type', 1, {
      school: this.school,
    });

    this.course = this.server.create('course', {
      school: this.school,
    });

    for (let i = 0; i < 100; i++) {
      this.server.create('session', {
        course: this.course,
        sessionType: this.sessionTypes[0],
        instructionalNotes: `session ${i} notes`,
      });
    }

    let start = performance.now();

    await visit('/courses/1');

    let end = performance.now();
    let duration = end - start;

    assert.strictEqual(currentRouteName(), 'course.index', 'current route name is correct');
    assert.ok(
      duration < this.durationModerate,
      `Render time was ${duration}ms`,
      `route loaded in allowable: ${duration}`,
    );
  });

  test('/learnergroups', async function (assert) {
    this.server.createList('user', 20);
    const program = this.server.create('program', { school: this.school });
    const programYear = this.server.create('program-year', { program });
    const cohort = this.server.create('cohort', { programYear });

    for (let i = 2; i < 22; i += 5) {
      this.server.create('learner-group', {
        cohort,
        userIds: [i, i + 1, i + 2, i + 3, i + 4],
      });
    }

    let start = performance.now();

    await visit('/learnergroups');

    let end = performance.now();
    let duration = end - start;

    assert.strictEqual(currentRouteName(), 'learner-groups', 'current route name is correct');
    assert.ok(
      duration < this.durationQuick,
      `Render time was ${duration}ms`,
      `route loaded in allowable time: ${duration}`,
    );
  });

  test('/instructorgroups', async function (assert) {
    this.server.createList('user', 50);

    for (let i = 2; i < 52; i += 5) {
      this.server.create('instructor-group', {
        school: this.school,
        userIds: [i, i + 1, i + 2, i + 3, i + 4],
      });
    }

    let start = performance.now();

    await visit('/instructorgroups');

    let end = performance.now();
    let duration = end - start;

    assert.strictEqual(currentRouteName(), 'instructor-groups', 'current route is correct');
    assert.ok(
      duration < this.durationQuick,
      `Render time was ${duration}ms`,
      `route loaded in allowable time: ${duration}`,
    );
  });

  test('/schools', async function (assert) {
    for (let i = 0; i < 20; i++) {
      this.server.create('school');
    }

    let start = performance.now();

    await visit('/schools');

    let end = performance.now();
    let duration = end - start;

    assert.strictEqual(currentRouteName(), 'schools', 'current route name is correct');
    assert.ok(
      duration < this.durationQuick,
      `Render time was ${duration}ms`,
      `route loaded in allowable time: ${duration}`,
    );
  });

  test('/programs', async function (assert) {
    for (let i = 0; i < 20; i++) {
      this.server.create('program');
    }

    let start = performance.now();

    await visit('/programs');

    let end = performance.now();
    let duration = end - start;

    assert.strictEqual(currentRouteName(), 'programs', 'current route name is correct');
    assert.ok(
      duration < this.durationQuick,
      `Render time was ${duration}ms`,
      `route loaded in allowable time: ${duration}`,
    );
  });

  test('/reports', async function (assert) {
    this.server.create('academic-year');
    this.sessionTypes = this.server.createList('session-type', 1, {
      school: this.school,
    });

    const courses = [];
    for (let i = 0; i < 10; i++) {
      courses.push(
        this.server.create('course', {
          id: i,
          school: this.school,
        }),
      );
    }

    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        this.server.create('session', {
          id: j,
          course: courses[i],
          sessionType: this.sessionTypes[0],
          instructionalNotes: `course ${i} session ${j} notes`,
        });
      }
    }

    for (let i = 0; i < 10; i++) {
      this.server.create('report', {
        title: `my report {i}`,
        subject: 'session',
        prepositionalObject: 'course',
        prepositionalObjectTableRowId: courses[i].id,
        user: this.user,
        school: this.school,
      });
    }

    let start = performance.now();

    await visit('/reports');

    let end = performance.now();
    let duration = end - start;

    assert.strictEqual(currentRouteName(), 'reports.subjects', 'current route name is correct');
    assert.ok(
      duration < this.durationQuick,
      `Render time was ${duration}ms`,
      `route loaded in allowable time: ${duration}`,
    );
  });

  test('/admin', async function (assert) {
    let start = performance.now();

    await visit('/admin');

    let end = performance.now();
    let duration = end - start;

    assert.strictEqual(currentRouteName(), 'admin-dashboard', 'current route name is correct');
    assert.ok(
      duration < this.durationQuick,
      `Render time was ${duration}ms`,
      `route loaded in allowable time: ${duration}`,
    );
  });

  test('/users', async function (assert) {
    this.server.createList('user', 25);

    let start = performance.now();

    await visit('/users');

    let end = performance.now();
    let duration = end - start;

    assert.strictEqual(currentRouteName(), 'users', 'current route name is correct');
    assert.ok(
      duration < this.durationQuick,
      `Render time was ${duration}ms`,
      `route loaded in allowable time: ${duration}`,
    );
  });

  test('/curriculum-inventory-reports', async function (assert) {
    this.program = this.server.create('program', { school: this.school });

    for (let i = 0; i < 10; i++) {
      this.server.create('curriculum-inventory-report', {
        program: this.program,
      });
    }

    let start = performance.now();

    await visit('/curriculum-inventory-reports');

    let end = performance.now();
    let duration = end - start;

    assert.strictEqual(
      currentRouteName(),
      'curriculum-inventory-reports',
      'current route name is correct',
    );
    assert.ok(
      duration < this.durationQuick,
      `Render time was ${duration}ms`,
      `route loaded in allowable time: ${duration}`,
    );
  });
});
