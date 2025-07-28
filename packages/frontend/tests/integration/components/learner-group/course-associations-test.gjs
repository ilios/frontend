import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import { render } from '@ember/test-helpers';
import { component } from 'frontend/tests/pages/components/learner-group/course-associations';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import CourseAssociations from 'frontend/components/learner-group/course-associations';
import noop from 'ilios-common/helpers/noop';

module('Integration | Component | learner-group/course-associations', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const school = this.server.create('school', { title: 'Medicine' });
    const program = this.server.create('program', { school });
    const programYear = this.server.create('program-year', { program });
    const cohort = this.server.create('cohort', { programYear });
    this.learnerGroup = this.server.create('learner-group', { cohort });
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
      learnerGroups: [this.learnerGroup],
    });
    this.server.create('ilmSession', {
      session: sessionInCourse3,
      learnerGroups: [this.learnerGroup],
    });
    this.server.createList('offering', 2, {
      session: sessionsInCourse2[0],
      learnerGroups: [this.learnerGroup],
    });
    this.server.createList('offering', 2, {
      session: sessionsInCourse2[1],
      learnerGroups: [this.learnerGroup],
    });
    this.server.createList('offering', 2, {
      session: sessionInCourse1,
      learnerGroups: [this.learnerGroup],
    });

    const learnerGroup = await this.owner
      .lookup('service:store')
      .findRecord('learner-group', this.learnerGroup.id);
    this.set('learnerGroup', learnerGroup);
    await render(
      <template>
        <CourseAssociations
          @learnerGroup={{this.learnerGroup}}
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

    assert.strictEqual(component.content.headers.course.text, 'Course');
    assert.strictEqual(component.content.headers.sessions.text, 'Sessions');

    assert.strictEqual(component.content.associations.length, 3);
    assert.strictEqual(component.content.associations[0].course.text, 'school 1 | course 0 (2025)');
    assert.strictEqual(component.content.associations[0].course.link, '/courses/1');
    assert.strictEqual(component.content.associations[0].sessions.length, 1);
    assert.strictEqual(component.content.associations[0].sessions[0].text, 'session 0');
    assert.strictEqual(component.content.associations[0].sessions[0].link, '/courses/1/sessions/1');
    assert.strictEqual(component.content.associations[1].course.text, 'school 1 | course 1 (2025)');
    assert.strictEqual(component.content.associations[1].course.link, '/courses/2');
    assert.strictEqual(component.content.associations[1].sessions.length, 2);
    assert.strictEqual(component.content.associations[1].sessions[0].text, 'session 1');
    assert.strictEqual(component.content.associations[1].sessions[0].link, '/courses/2/sessions/2');
    assert.strictEqual(component.content.associations[1].sessions[1].text, 'session 2');
    assert.strictEqual(component.content.associations[1].sessions[1].link, '/courses/2/sessions/3');
    assert.strictEqual(component.content.associations[2].course.text, 'school 2 | course 2 (2025)');
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
      learnerGroups: [this.learnerGroup],
    });
    this.server.create('ilmSession', {
      session: sessionInCourse3,
      learnerGroups: [this.learnerGroup],
    });
    this.server.createList('offering', 2, {
      session: sessionsInCourse2[0],
      learnerGroups: [this.learnerGroup],
    });
    this.server.createList('offering', 2, {
      session: sessionsInCourse2[1],
      learnerGroups: [this.learnerGroup],
    });
    this.server.createList('offering', 2, {
      session: sessionInCourse1,
      learnerGroups: [this.learnerGroup],
    });

    const learnerGroup = await this.owner
      .lookup('service:store')
      .findRecord('learner-group', this.learnerGroup.id);
    this.set('learnerGroup', learnerGroup);
    await render(
      <template>
        <CourseAssociations
          @learnerGroup={{this.learnerGroup}}
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
    const learnerGroup = await this.owner
      .lookup('service:store')
      .findRecord('learner-group', this.learnerGroup.id);
    this.set('learnerGroup', learnerGroup);
    await render(<template><CourseAssociations @learnerGroup={{this.learnerGroup}} /></template>);

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
    this.server.create('offering', { session: session1, learnerGroups: [this.learnerGroup] });
    this.server.create('offering', { session: session2, learnerGroups: [this.learnerGroup] });
    const learnerGroup = await this.owner
      .lookup('service:store')
      .findRecord('learner-group', this.learnerGroup.id);
    this.set('learnerGroup', learnerGroup);
    await render(
      <template>
        <CourseAssociations
          @learnerGroup={{this.learnerGroup}}
          @isExpanded={{true}}
          @setIsExpanded={{(noop)}}
        />
      </template>,
    );

    assert.strictEqual(component.content.associations.length, 2);
    assert.ok(component.content.headers.course.isSortedAscending);
    assert.strictEqual(component.content.associations[0].course.text, 'school 1 | course 0 (2025)');
    assert.strictEqual(component.content.associations[1].course.text, 'school 2 | course 1 (2025)');

    await component.content.headers.course.sort();
    assert.ok(component.content.headers.course.isSortedDescending);
    assert.strictEqual(component.content.associations[0].course.text, 'school 2 | course 1 (2025)');
    assert.strictEqual(component.content.associations[1].course.text, 'school 1 | course 0 (2025)');

    await component.content.headers.course.sort();
    assert.ok(component.content.headers.course.isSortedAscending);
    assert.strictEqual(component.content.associations[0].course.text, 'school 1 | course 0 (2025)');
    assert.strictEqual(component.content.associations[1].course.text, 'school 2 | course 1 (2025)');
  });

  test('crossing academic year boundaries is correctly reflected', async function (assert) {
    const school = this.server.create('school');
    const course = this.server.create('course', { school, year: 2025 });
    const session = this.server.create('session', { course });
    this.server.create('offering', { session, learnerGroups: [this.learnerGroup] });
    const learnerGroup = await this.owner
      .lookup('service:store')
      .findRecord('learner-group', this.learnerGroup.id);
    this.set('learnerGroup', learnerGroup);
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
          @learnerGroup={{this.learnerGroup}}
          @isExpanded={{true}}
          @setIsExpanded={{(noop)}}
        />
      </template>,
    );

    assert.strictEqual(component.content.associations.length, 1);
    assert.strictEqual(
      component.content.associations[0].course.text,
      'school 1 | course 0 (2025 - 2026)',
    );
  });

  test('collapse action fires', async function (assert) {
    assert.expect(1);
    const school = this.server.create('school');
    const course = this.server.create('course', { school, year: 2025 });
    const session = this.server.create('session', { course });
    this.server.create('offering', { session, learnerGroups: [this.learnerGroup] });
    const learnerGroup = await this.owner
      .lookup('service:store')
      .findRecord('learner-group', this.learnerGroup.id);
    this.set('learnerGroup', learnerGroup);
    this.set('setIsExpanded', (value) => {
      assert.notOk(value);
    });
    await render(
      <template>
        <CourseAssociations
          @learnerGroup={{this.learnerGroup}}
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
    this.server.create('offering', { session, learnerGroups: [this.learnerGroup] });
    const learnerGroup = await this.owner
      .lookup('service:store')
      .findRecord('learner-group', this.learnerGroup.id);
    this.set('learnerGroup', learnerGroup);
    this.set('setIsExpanded', (value) => {
      assert.ok(value);
    });
    await render(
      <template>
        <CourseAssociations
          @learnerGroup={{this.learnerGroup}}
          @isExpanded={{false}}
          @setIsExpanded={{this.setIsExpanded}}
        />
      </template>,
    );

    await component.header.toggle.click();
  });
});
