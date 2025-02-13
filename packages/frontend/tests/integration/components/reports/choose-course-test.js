import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupAuthentication, freezeDateAt, unfreezeDate } from 'ilios-common';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import { DateTime } from 'luxon';
import { component } from 'frontend/tests/pages/components/reports/curriculum/choose-course';

module('Integration | Component | reports/choose-course', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const { apiVersion } = this.owner.resolveRegistration('config:environment');
    this.server.get('application/config', function () {
      return {
        config: {
          academicYearCrossesCalendarYearBoundaries: true,
          apiVersion,
        },
      };
    });
    freezeDateAt(
      DateTime.fromObject({
        month: 11,
        day: 11,
        year: 1984,
      }).toJSDate(),
    );
  });

  hooks.afterEach(() => {
    unfreezeDate();
  });

  const buildSchoolsFromData = (server) => {
    const schools = server.db.schools;
    const allCourseData = server.db.courses;
    return schools.map((school) => {
      const courseIds = school.courseIds;
      const courses = allCourseData.filter((course) => courseIds.includes(course.id));
      const years = courses.map(({ year }) => year);
      const uniqueYears = [...new Set(years)].sort().reverse();
      return {
        id: school.id,
        title: school.title,
        years: uniqueYears.map((year) => {
          return {
            year,
            courses: courses.filter((course) => course.year === year),
          };
        }),
      };
    });
  };

  test('it renders with one school', async function (assert) {
    const school = this.server.create('school');
    this.server.create('academicYear', { id: 1984 });
    this.server.create('academicYear', { id: 1985 });
    this.server.create('academicYear', { id: 1983 });
    this.server.createList('course', 3, {
      school,
      year: 1984,
    });
    this.server.createList('course', 1, {
      school,
      year: 1985,
    });
    this.server.createList('course', 2, {
      school,
      year: 1983,
    });
    await setupAuthentication({ school });
    this.set('selectedCourseIds', ['2']);
    this.set('schools', buildSchoolsFromData(this.server));
    await render(hbs`<Reports::ChooseCourse
  @selectedCourseIds={{this.selectedCourseIds}}
  @schools={{this.schools}}
  @add={{(noop)}}
  @remove={{(noop)}}
/>`);

    assert.notOk(component.hasMultipleSchools);
    assert.strictEqual(component.years.length, 3);
    assert.strictEqual(component.years[0].title, '1985');
    assert.notOk(component.years[0].isExpanded);
    assert.strictEqual(component.years[1].title, '1984');
    assert.ok(component.years[1].isExpanded);
    assert.strictEqual(component.years[2].title, '1983');
    assert.notOk(component.years[2].isExpanded);

    assert.ok(component.years[1].isPartiallySelected);
    assert.notOk(component.years[1].isFullySelected);

    assert.strictEqual(component.years[1].courses.length, 3);
    assert.strictEqual(component.years[1].courses[0].text, 'course 0');
    assert.notOk(component.years[1].courses[0].isSelected);
    assert.strictEqual(component.years[1].courses[1].text, 'course 1');
    assert.ok(component.years[1].courses[1].isSelected);
    assert.strictEqual(component.years[1].courses[2].text, 'course 2');
    assert.notOk(component.years[1].courses[2].isSelected);
  });

  test('it renders with multiple schools', async function (assert) {
    const school = this.server.create('school');
    const school2 = this.server.create('school');
    await setupAuthentication({ school });

    this.server.create('academicYear', { id: 1984 });
    this.server.create('course', {
      school,
      year: 1984,
    });
    this.server.create('course', {
      school: school2,
      year: 1984,
    });
    this.set('schools', buildSchoolsFromData(this.server));
    this.set('selectedCourseIds', []);
    await render(hbs`<Reports::ChooseCourse
  @selectedCourseIds={{this.selectedCourseIds}}
  @schools={{this.schools}}
  @add={{(noop)}}
  @remove={{(noop)}}
/>`);

    assert.ok(component.hasMultipleSchools);
    assert.strictEqual(component.schoolSelector.options.length, 2);
    assert.strictEqual(component.schoolSelector.value, school.id);
    assert.strictEqual(component.schoolSelector.options[0].text, school.title);
    assert.ok(component.schoolSelector.options[0].isSelected);
    assert.strictEqual(component.schoolSelector.options[1].text, school2.title);
    assert.notOk(component.schoolSelector.options[1].isSelected);

    assert.strictEqual(component.years.length, 1);
    assert.strictEqual(component.years[0].title, '1984');
    assert.ok(component.years[0].isExpanded);

    assert.notOk(component.years[0].isPartiallySelected);
    assert.notOk(component.years[0].isFullySelected);

    assert.strictEqual(component.years[0].courses.length, 1);
    assert.strictEqual(component.years[0].courses[0].text, 'course 0');
    assert.notOk(component.years[0].courses[0].isSelected);
  });

  test('select course fires action', async function (assert) {
    assert.expect(2);
    const school = this.server.create('school');
    await setupAuthentication({ school });
    this.server.create('academicYear', { id: 1984 });
    const course = this.server.create('course', {
      school,
      year: 1984,
    });
    this.set('selectedCourseIds', []);
    this.set('schools', buildSchoolsFromData(this.server));
    this.set('add', (courseId) => {
      assert.strictEqual(courseId, course.id);
    });
    await render(hbs`<Reports::ChooseCourse
  @selectedCourseIds={{this.selectedCourseIds}}
  @schools={{this.schools}}
  @add={{this.add}}
  @remove={{(noop)}}
/>`);

    assert.notOk(component.years[0].courses[0].isSelected);
    await component.years[0].courses[0].pick();
  });

  test('remove course fires action', async function (assert) {
    assert.expect(2);
    const school = this.server.create('school');
    await setupAuthentication({ school });
    this.server.create('academicYear', { id: 1984 });
    const course = this.server.create('course', {
      school,
      year: 1984,
    });
    this.set('selectedCourseIds', [course.id]);
    this.set('schools', buildSchoolsFromData(this.server));
    this.set('remove', (courseId) => {
      assert.strictEqual(courseId, course.id);
    });
    await render(hbs`<Reports::ChooseCourse
  @selectedCourseIds={{this.selectedCourseIds}}
  @schools={{this.schools}}
  @add={{(noop)}}
  @remove={{this.remove}}
/>`);

    assert.ok(component.years[0].courses[0].isSelected);
    await component.years[0].courses[0].pick();
  });

  test('select all fires action', async function (assert) {
    const school = this.server.create('school');
    await setupAuthentication({ school });
    this.server.create('academicYear', { id: 1984 });
    const courses = this.server.createList('course', 2, {
      school,
      year: 1984,
    });
    this.set('selectedCourseIds', [courses[0].id]);
    this.set('schools', buildSchoolsFromData(this.server));
    this.set('add', (courseId) => {
      this.set('selectedCourseIds', [...this.selectedCourseIds, courseId]);
    });
    await render(hbs`<Reports::ChooseCourse
  @selectedCourseIds={{this.selectedCourseIds}}
  @schools={{this.schools}}
  @add={{this.add}}
  @remove={{(noop)}}
/>`);

    assert.ok(component.years[0].isPartiallySelected);
    assert.notOk(component.years[0].isFullySelected);
    assert.ok(component.years[0].courses[0].isSelected);
    assert.notOk(component.years[0].courses[1].isSelected);
    await component.years[0].toggleAll();
    assert.ok(component.years[0].isFullySelected);
    assert.notOk(component.years[0].isPartiallySelected);
    assert.ok(component.years[0].isFullySelected);
    assert.ok(component.years[0].courses[0].isSelected);
    assert.ok(component.years[0].courses[1].isSelected);
  });

  test('select none fires action', async function (assert) {
    const school = this.server.create('school');
    await setupAuthentication({ school });
    this.server.create('academicYear', { id: 1984 });
    const courses = this.server.createList('course', 2, {
      school,
      year: 1984,
    });
    this.set(
      'selectedCourseIds',
      courses.map(({ id }) => id),
    );
    this.set('schools', buildSchoolsFromData(this.server));
    this.set('remove', (courseId) => {
      this.set(
        'selectedCourseIds',
        this.selectedCourseIds.filter((id) => id !== courseId),
      );
    });
    await render(hbs`<Reports::ChooseCourse
  @selectedCourseIds={{this.selectedCourseIds}}
  @schools={{this.schools}}
  @add={{(noop)}}
  @remove={{this.remove}}
/>`);

    assert.notOk(component.years[0].isPartiallySelected);
    assert.ok(component.years[0].isFullySelected);
    assert.ok(component.years[0].courses[0].isSelected);
    assert.ok(component.years[0].courses[1].isSelected);
    await component.years[0].toggleAll();
    assert.notOk(component.years[0].isPartiallySelected);
    assert.notOk(component.years[0].isFullySelected);
    assert.notOk(component.years[0].courses[0].isSelected);
    assert.notOk(component.years[0].courses[1].isSelected);
  });
});
