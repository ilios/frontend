import { module, test } from 'qunit';
import { render } from '@ember/test-helpers';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import noop from 'ilios-common/helpers/noop';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import { component } from 'frontend/tests/pages/components/program-year/course-associations';
import CourseAssociations from 'frontend/components/program-year/course-associations';

module('Integration | Component | program-year/course-associations', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const school = this.server.create('school');
    const program = this.server.create('program', { school });
    const programYear = this.server.create('program-year', { program });
    this.cohort = this.server.create('cohort', { programYear });
    this.programYear = programYear;
    this.school = school;
  });

  test('it renders expanded with data', async function (assert) {
    const otherSchool = this.server.create('school');
    this.server.createList('course', 2, {
      school: this.school,
      year: 2025,
      cohorts: [this.cohort],
    });
    this.server.create('course', { school: otherSchool, year: 2025, cohorts: [this.cohort] });

    const programYear = await this.owner
      .lookup('service:store')
      .findRecord('program-year', this.programYear.id);
    this.set('programYear', programYear);
    await render(
      <template>
        <CourseAssociations
          @programYear={{this.programYear}}
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

    assert.strictEqual(component.content.associations.length, 3);
    assert.strictEqual(component.content.associations[0].school, 'school 0');
    assert.strictEqual(component.content.associations[0].course.text, 'course 0 (2025)');
    assert.strictEqual(component.content.associations[0].course.link, '/courses/1');
    assert.strictEqual(component.content.associations[1].school, 'school 0');
    assert.strictEqual(component.content.associations[1].course.text, 'course 1 (2025)');
    assert.strictEqual(component.content.associations[1].course.link, '/courses/2');
    assert.strictEqual(component.content.associations[2].school, 'school 1');
    assert.strictEqual(component.content.associations[2].course.text, 'course 2 (2025)');
    assert.strictEqual(component.content.associations[2].course.link, '/courses/3');
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('it renders collapsed with data', async function (assert) {
    const otherSchool = this.server.create('school');
    this.server.createList('course', 2, {
      school: this.school,
      year: 2025,
      cohorts: [this.cohort],
    });
    this.server.create('course', { school: otherSchool, year: 2025, cohorts: [this.cohort] });

    const programYear = await this.owner
      .lookup('service:store')
      .findRecord('program-year', this.programYear.id);
    this.set('programYear', programYear);
    await render(
      <template>
        <CourseAssociations
          @programYear={{this.programYear}}
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
    const programYear = await this.owner
      .lookup('service:store')
      .findRecord('program-year', this.programYear.id);
    this.set('programYear', programYear);
    await render(
      <template>
        <CourseAssociations
          @programYear={{this.programYear}}
          @isExpanded={{false}}
          @setIsExpanded={{(noop)}}
        />
      </template>,
    );

    assert.notOk(component.header.toggle.isPresent);
    assert.strictEqual(component.header.title, 'Associated Courses (0)');
    assert.notOk(component.content.isPresent);
  });

  test('sorting works', async function (assert) {
    const otherSchool = this.server.create('school');
    this.server.create('course', {
      school: this.school,
      year: 2025,
      cohorts: [this.cohort],
    });
    this.server.create('course', { school: otherSchool, year: 2025, cohorts: [this.cohort] });

    const programYear = await this.owner
      .lookup('service:store')
      .findRecord('program-year', this.programYear.id);
    this.set('programYear', programYear);
    await render(
      <template>
        <CourseAssociations
          @programYear={{this.programYear}}
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
    const { apiVersion } = this.owner.resolveRegistration('config:environment');
    this.server.get('application/config', function () {
      return {
        config: {
          academicYearCrossesCalendarYearBoundaries: true,
          apiVersion,
        },
      };
    });
    this.server.create('course', {
      school: this.school,
      year: 2025,
      cohorts: [this.cohort],
    });
    const programYear = await this.owner
      .lookup('service:store')
      .findRecord('program-year', this.programYear.id);
    this.set('programYear', programYear);
    await render(
      <template>
        <CourseAssociations
          @programYear={{this.programYear}}
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
    this.server.create('course', {
      school: this.school,
      year: 2025,
      cohorts: [this.cohort],
    });
    const programYear = await this.owner
      .lookup('service:store')
      .findRecord('program-year', this.programYear.id);
    this.set('programYear', programYear);
    this.set('setIsExpanded', (value) => {
      assert.notOk(value);
    });
    await render(
      <template>
        <CourseAssociations
          @programYear={{this.programYear}}
          @isExpanded={{true}}
          @setIsExpanded={{this.setIsExpanded}}
        />
      </template>,
    );

    await component.header.toggle.click();
  });

  test('expand action fires', async function (assert) {
    assert.expect(1);
    this.server.create('course', {
      school: this.school,
      year: 2025,
      cohorts: [this.cohort],
    });
    const programYear = await this.owner
      .lookup('service:store')
      .findRecord('program-year', this.programYear.id);
    this.set('programYear', programYear);
    this.set('setIsExpanded', (value) => {
      assert.ok(value);
    });
    await render(
      <template>
        <CourseAssociations
          @programYear={{this.programYear}}
          @isExpanded={{false}}
          @setIsExpanded={{this.setIsExpanded}}
        />
      </template>,
    );

    await component.header.toggle.click();
  });
});
