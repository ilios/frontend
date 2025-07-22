import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import { render } from '@ember/test-helpers';
import { component } from 'frontend/tests/pages/components/instructor-group/course-associations';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import CourseAssociations from 'frontend/components/instructor-group/course-associations';
import noop from 'ilios-common/helpers/noop';

module('Integration | Component | instructor-group/course-associations', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    this.instructorGroup = this.server.create('instructor-group');
  });

  test('it renders expanded with data', async function (assert) {
    const schools = this.server.createList('school', 2);
    const coursesInSchool1 = this.server.createList('course', 2, {
      school: schools[0],
      year: 2025,
    });
    const courseInSchool2 = this.server.create('course', { school: schools[1], year: 2025 });
    const sessionInCourse1 = this.server.create('session', { course: coursesInSchool1[0] });
    const sessionsInCourse2 = this.server.createList('session', 2, { course: coursesInSchool1[1] });
    const sessionInCourse3 = this.server.create('session', { course: courseInSchool2 });
    this.server.create('ilmSession', {
      session: sessionsInCourse2[0],
      instructorGroups: [this.instructorGroup],
    });
    this.server.create('ilmSession', {
      session: sessionInCourse3,
      instructorGroups: [this.instructorGroup],
    });
    this.server.createList('offering', 2, {
      session: sessionsInCourse2[0],
      instructorGroups: [this.instructorGroup],
    });
    this.server.createList('offering', 2, {
      session: sessionsInCourse2[1],
      instructorGroups: [this.instructorGroup],
    });
    this.server.createList('offering', 2, {
      session: sessionInCourse1,
      instructorGroups: [this.instructorGroup],
    });

    const instructorGroup = await this.owner
      .lookup('service:store')
      .findRecord('instructor-group', this.instructorGroup.id);
    this.set('instructorGroup', instructorGroup);
    await render(
      <template>
        <CourseAssociations
          @instructorGroup={{this.instructorGroup}}
          @isExpanded={{true}}
          @setIsExpanded={{(noop)}}
        />
      </template>,
    );

    assert.strictEqual(component.header.toggle.ariaControls, component.content.id);
    assert.notOk(component.header.toggle.isCollapsed);
    assert.ok(component.header.toggle.isExpanded);
    assert.strictEqual(component.header.toggle.ariaExpanded, 'true');
    assert.strictEqual(component.header.toggle.ariaLabel, 'Hide associated courses');
    assert.notOk(component.content.isHidden);
    assert.strictEqual(component.header.title, 'Associated Courses (3)');

    assert.strictEqual(component.content.headers.school.text, 'School');
    assert.strictEqual(component.content.headers.course.text, 'Course');
    assert.strictEqual(component.content.headers.sessions.text, 'Sessions');

    assert.strictEqual(component.content.associations.length, 3);
    assert.strictEqual(component.content.associations[0].school, 'school 0');
    assert.strictEqual(component.content.associations[0].course.text, 'course 1 (2025)');
    assert.strictEqual(component.content.associations[0].course.link, '/courses/2');
    assert.strictEqual(component.content.associations[0].sessions.length, 2);
    assert.strictEqual(component.content.associations[0].sessions[0].text, 'session 1');
    assert.strictEqual(component.content.associations[0].sessions[0].link, '/courses/2/sessions/2');
    assert.strictEqual(component.content.associations[0].sessions[1].text, 'session 2');
    assert.strictEqual(component.content.associations[0].sessions[1].link, '/courses/2/sessions/3');
    assert.strictEqual(component.content.associations[1].school, 'school 0');
    assert.strictEqual(component.content.associations[1].course.text, 'course 0 (2025)');
    assert.strictEqual(component.content.associations[1].course.link, '/courses/1');
    assert.strictEqual(component.content.associations[1].sessions.length, 1);
    assert.strictEqual(component.content.associations[1].sessions[0].text, 'session 0');
    assert.strictEqual(component.content.associations[1].sessions[0].link, '/courses/1/sessions/1');
    assert.strictEqual(component.content.associations[2].school, 'school 1');
    assert.strictEqual(component.content.associations[2].course.text, 'course 2 (2025)');
    assert.strictEqual(component.content.associations[2].course.link, '/courses/3');
    assert.strictEqual(component.content.associations[2].sessions.length, 1);
    assert.strictEqual(component.content.associations[2].sessions[0].text, 'session 3');
    assert.strictEqual(component.content.associations[2].sessions[0].link, '/courses/3/sessions/4');
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('it renders collapsed with data', async function (assert) {
    const schools = this.server.createList('school', 2);
    const coursesInSchool1 = this.server.createList('course', 2, {
      school: schools[0],
      year: 2025,
    });
    const courseInSchool2 = this.server.create('course', { school: schools[1], year: 2025 });
    const sessionInCourse1 = this.server.create('session', { course: coursesInSchool1[0] });
    const sessionsInCourse2 = this.server.createList('session', 2, { course: coursesInSchool1[1] });
    const sessionInCourse3 = this.server.create('session', { course: courseInSchool2 });
    this.server.create('ilmSession', {
      session: sessionsInCourse2[0],
      instructorGroups: [this.instructorGroup],
    });
    this.server.create('ilmSession', {
      session: sessionInCourse3,
      instructorGroups: [this.instructorGroup],
    });
    this.server.createList('offering', 2, {
      session: sessionsInCourse2[0],
      instructorGroups: [this.instructorGroup],
    });
    this.server.createList('offering', 2, {
      session: sessionsInCourse2[1],
      instructorGroups: [this.instructorGroup],
    });
    this.server.createList('offering', 2, {
      session: sessionInCourse1,
      instructorGroups: [this.instructorGroup],
    });

    const instructorGroup = await this.owner
      .lookup('service:store')
      .findRecord('instructor-group', this.instructorGroup.id);
    this.set('instructorGroup', instructorGroup);
    await render(
      <template>
        <CourseAssociations
          @instructorGroup={{this.instructorGroup}}
          @isExpanded={{false}}
          @setIsExpanded={{(noop)}}
        />
      </template>,
    );

    assert.strictEqual(component.header.toggle.ariaControls, component.content.id);
    assert.ok(component.header.toggle.isCollapsed);
    assert.notOk(component.header.toggle.isExpanded);
    assert.strictEqual(component.header.toggle.ariaExpanded, 'false');
    assert.strictEqual(component.header.toggle.ariaLabel, 'Show associated courses');
    assert.ok(component.content.isHidden);
    assert.strictEqual(component.header.title, 'Associated Courses (3)');
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('it renders without data', async function (assert) {
    const instructorGroup = await this.owner
      .lookup('service:store')
      .findRecord('instructor-group', this.instructorGroup.id);
    this.set('instructorGroup', instructorGroup);
    await render(
      <template><CourseAssociations @instructorGroup={{this.instructorGroup}} /></template>,
    );

    assert.notOk(component.header.toggle.isPresent);
    assert.strictEqual(component.header.title, 'Associated Courses (0)');
    assert.notOk(component.content.isPresent);
  });

  test('sorting works', async function (assert) {
    const schools = this.server.createList('school', 2);
    const course1 = this.server.create('course', { school: schools[0], year: 2025 });
    const course2 = this.server.create('course', { school: schools[1], year: 2025 });
    const session1 = this.server.create('session', { course: course1 });
    const session2 = this.server.create('session', { course: course2 });
    this.server.create('offering', { session: session1, instructorGroups: [this.instructorGroup] });
    this.server.create('offering', { session: session2, instructorGroups: [this.instructorGroup] });
    const instructorGroup = await this.owner
      .lookup('service:store')
      .findRecord('instructor-group', this.instructorGroup.id);
    this.set('instructorGroup', instructorGroup);
    await render(
      <template>
        <CourseAssociations
          @instructorGroup={{this.instructorGroup}}
          @isExpanded={{true}}
          @setIsExpanded={{(noop)}}
        />
      </template>,
    );

    assert.strictEqual(component.content.associations.length, 2);
    assert.ok(component.content.headers.school.isSortedAscending);
    assert.ok(component.content.headers.course.isNotSorted);
    assert.strictEqual(component.content.associations[0].school, 'school 0');
    assert.strictEqual(component.content.associations[0].course.text, 'course 0 (2025)');
    assert.strictEqual(component.content.associations[1].school, 'school 1');
    assert.strictEqual(component.content.associations[1].course.text, 'course 1 (2025)');

    await component.content.headers.school.sort();
    assert.ok(component.content.headers.school.isSortedDescending);
    assert.ok(component.content.headers.course.isNotSorted);
    assert.strictEqual(component.content.associations[0].school, 'school 1');
    assert.strictEqual(component.content.associations[0].course.text, 'course 1 (2025)');
    assert.strictEqual(component.content.associations[1].school, 'school 0');
    assert.strictEqual(component.content.associations[1].course.text, 'course 0 (2025)');

    await component.content.headers.school.sort();
    assert.ok(component.content.headers.school.isSortedAscending);
    assert.ok(component.content.headers.course.isNotSorted);
    assert.strictEqual(component.content.associations[0].school, 'school 0');
    assert.strictEqual(component.content.associations[0].course.text, 'course 0 (2025)');
    assert.strictEqual(component.content.associations[1].school, 'school 1');
    assert.strictEqual(component.content.associations[1].course.text, 'course 1 (2025)');

    await component.content.headers.course.sort();
    assert.ok(component.content.headers.school.isNotSorted);
    assert.ok(component.content.headers.course.isSortedAscending);
    assert.strictEqual(component.content.associations[0].school, 'school 0');
    assert.strictEqual(component.content.associations[0].course.text, 'course 0 (2025)');
    assert.strictEqual(component.content.associations[1].school, 'school 1');
    assert.strictEqual(component.content.associations[1].course.text, 'course 1 (2025)');

    await component.content.headers.course.sort();
    assert.ok(component.content.headers.school.isNotSorted);
    assert.ok(component.content.headers.course.isSortedDescending);
    assert.strictEqual(component.content.associations[0].school, 'school 1');
    assert.strictEqual(component.content.associations[0].course.text, 'course 1 (2025)');
    assert.strictEqual(component.content.associations[1].school, 'school 0');
    assert.strictEqual(component.content.associations[1].course.text, 'course 0 (2025)');

    await component.content.headers.course.sort();
    assert.ok(component.content.headers.school.isNotSorted);
    assert.ok(component.content.headers.course.isSortedAscending);
    assert.strictEqual(component.content.associations[0].school, 'school 0');
    assert.strictEqual(component.content.associations[0].course.text, 'course 0 (2025)');
    assert.strictEqual(component.content.associations[1].school, 'school 1');
    assert.strictEqual(component.content.associations[1].course.text, 'course 1 (2025)');
  });

  test('crossing academic year boundaries is correctly reflected', async function (assert) {
    const school = this.server.create('school');
    const course = this.server.create('course', { school, year: 2025 });
    const session = this.server.create('session', { course });
    this.server.create('offering', { session, instructorGroups: [this.instructorGroup] });
    const instructorGroup = await this.owner
      .lookup('service:store')
      .findRecord('instructor-group', this.instructorGroup.id);
    this.set('instructorGroup', instructorGroup);
    const { apiVersion } = this.owner.resolveRegistration('config:environment');
    this.server.get('application/config', function () {
      return {
        config: {
          academicYearCrossesCalendarYearBoundaries: true,
          apiVersion,
        },
      };
    });
    await render(
      <template>
        <CourseAssociations
          @instructorGroup={{this.instructorGroup}}
          @isExpanded={{true}}
          @setIsExpanded={{(noop)}}
        />
      </template>,
    );

    assert.strictEqual(component.content.associations.length, 1);
    assert.strictEqual(component.content.associations[0].course.text, 'course 0 (2025 - 2026)');
  });

  test('collapse action fires', async function (assert) {
    assert.expect(1);
    const school = this.server.create('school');
    const course = this.server.create('course', { school, year: 2025 });
    const session = this.server.create('session', { course });
    this.server.create('offering', { session, instructorGroups: [this.instructorGroup] });
    const instructorGroup = await this.owner
      .lookup('service:store')
      .findRecord('instructor-group', this.instructorGroup.id);
    this.set('instructorGroup', instructorGroup);
    this.set('setIsExpanded', (value) => {
      assert.notOk(value);
    });
    await render(
      <template>
        <CourseAssociations
          @instructorGroup={{this.instructorGroup}}
          @isExpanded={{true}}
          @setIsExpanded={{this.setIsExpanded}}
        />
      </template>,
    );

    await component.header.toggle.click();
  });

  test('expand action fires', async function (assert) {
    assert.expect(1);
    const school = this.server.create('school');
    const course = this.server.create('course', { school, year: 2025 });
    const session = this.server.create('session', { course });
    this.server.create('offering', { session, instructorGroups: [this.instructorGroup] });
    const instructorGroup = await this.owner
      .lookup('service:store')
      .findRecord('instructor-group', this.instructorGroup.id);
    this.set('instructorGroup', instructorGroup);
    this.set('setIsExpanded', (value) => {
      assert.ok(value);
    });
    await render(
      <template>
        <CourseAssociations
          @instructorGroup={{this.instructorGroup}}
          @isExpanded={{false}}
          @setIsExpanded={{this.setIsExpanded}}
        />
      </template>,
    );

    await component.header.toggle.click();
  });
});
