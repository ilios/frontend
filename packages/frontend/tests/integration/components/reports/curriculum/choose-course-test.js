import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupAuthentication, freezeDateAt, unfreezeDate } from 'ilios-common';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import { DateTime } from 'luxon';
import { component } from 'frontend/tests/pages/components/reports/curriculum/choose-course';
import { buildSchoolsFromData } from 'frontend/tests/helpers/curriculum-report';
import a11yAudit from 'ember-a11y-testing/test-support/audit';

module('Integration | Component | reports/curriculum/choose-course', function (hooks) {
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

  test('it renders with one school and is accessible', async function (assert) {
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
    await render(hbs`<Reports::Curriculum::ChooseCourse
  @selectedCourseIds={{this.selectedCourseIds}}
  @schools={{this.schools}}
  @add={{(noop)}}
  @remove={{(noop)}}
  @removeAll={{(noop)}}
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

    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('it renders with multiple schools and is accessible', async function (assert) {
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
    await render(hbs`<Reports::Curriculum::ChooseCourse
  @selectedCourseIds={{this.selectedCourseIds}}
  @schools={{this.schools}}
  @add={{(noop)}}
  @remove={{(noop)}}
  @removeAll={{(noop)}}
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

    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('select course fires action', async function (assert) {
    assert.expect(3);
    const school = this.server.create('school');
    await setupAuthentication({ school });
    this.server.create('academicYear', { id: 1984 });
    const course = this.server.create('course', {
      school,
      year: 1984,
    });
    this.set('selectedCourseIds', []);
    this.set('schools', buildSchoolsFromData(this.server));
    this.set('add', (courseId, schoolId) => {
      assert.strictEqual(courseId, course.id);
      assert.strictEqual(schoolId, course.school.id);
    });
    await render(hbs`<Reports::Curriculum::ChooseCourse
  @selectedCourseIds={{this.selectedCourseIds}}
  @schools={{this.schools}}
  @add={{this.add}}
  @remove={{(noop)}}
  @removeAll={{(noop)}}
/>`);

    assert.notOk(component.years[0].courses[0].isSelected);
    await component.years[0].courses[0].pick();
  });

  test('remove course fires action', async function (assert) {
    assert.expect(3);
    const school = this.server.create('school');
    await setupAuthentication({ school });
    this.server.create('academicYear', { id: 1984 });
    const course = this.server.create('course', {
      school,
      year: 1984,
    });
    this.set('selectedCourseIds', [course.id]);
    this.set('schools', buildSchoolsFromData(this.server));
    this.set('remove', (courseId, schoolId) => {
      assert.strictEqual(courseId, course.id);
      assert.strictEqual(schoolId, course.school.id);
    });
    await render(hbs`<Reports::Curriculum::ChooseCourse
  @selectedCourseIds={{this.selectedCourseIds}}
  @schools={{this.schools}}
  @add={{(noop)}}
  @remove={{this.remove}}
  @removeAll={{(noop)}}
/>`);

    assert.ok(component.years[0].courses[0].isSelected);
    await component.years[0].courses[0].pick();
  });

  test('deselect all button visible only when course is selected', async function (assert) {
    assert.expect(3);
    const school = this.server.create('school');
    await setupAuthentication({ school });
    this.server.create('academicYear', { id: 1984 });
    const course = this.server.create('course', {
      school,
      year: 1984,
    });
    this.set('selectedCourseIds', [course.id]);
    this.set('schools', buildSchoolsFromData(this.server));
    this.set('add', (courseId) => {
      this.set('selectedCourseIds', [...this.selectedCourseIds, courseId]);
    });
    this.set('remove', (courseId) => {
      this.set(
        'selectedCourseIds',
        this.selectedCourseIds.filter((id) => id !== courseId),
      );
    });
    this.set('removeAll', () => {
      this.set('selectedCourseIds', []);
    });
    await render(hbs`<Reports::Curriculum::ChooseCourse
  @selectedCourseIds={{this.selectedCourseIds}}
  @schools={{this.schools}}
  @add={{this.add}}
  @remove={{this.remove}}
  @removeAll={{this.removeAll}}
/>`);

    assert.ok(component.deselectAll.visible, 'deselect button is visible');
    await component.years[0].courses[0].pick();
    assert.notOk(component.deselectAll.visible, 'deselect button is not visible');
    await component.years[0].courses[0].pick();
    assert.ok(component.deselectAll.visible, 'deselect button is visible');
  });

  test('deselect all courses fires action', async function (assert) {
    assert.expect(6);
    const school = this.server.create('school');
    await setupAuthentication({ school });
    this.server.create('academicYear', { id: 1984 });
    const course1 = this.server.create('course', {
      school,
      year: 1984,
    });
    const course2 = this.server.create('course', {
      school,
      year: 1985,
    });
    this.set('selectedCourseIds', [course1.id, course2.id]);
    this.set('selectedSchoolIds', [course1.school.id, course2.school.id]);
    this.set('schools', buildSchoolsFromData(this.server));
    this.set('removeAll', () => {
      this.set('selectedCourseIds', []);
    });
    await render(hbs`<Reports::Curriculum::ChooseCourse
  @selectedCourseIds={{this.selectedCourseIds}}
  @selectedSchoolIds={{this.selectedSchoolIds}}
  @schools={{this.schools}}
  @add={{(noop)}}
  @remove={{noop}}
  @removeAll={{this.removeAll}}
/>`);

    assert.ok(component.years[0].isFullySelected, '1984 is fully selected');
    assert.ok(component.years[1].isFullySelected, '1985 is fully selected');
    assert.ok(component.years[1].courses[0].isSelected, '1985 course 1 is visible and selected');
    await component.deselectAll.click();
    assert.notOk(component.years[0].isFullySelected, '1984 is not selected');
    assert.notOk(component.years[1].isFullySelected, '1985 is not selected');
    assert.notOk(
      component.years[1].courses[0].isSelected,
      '1985 course 1 is visible and unselected',
    );
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
    this.set('selectedSchoolIds', [courses[0].school.id]);
    this.set('schools', buildSchoolsFromData(this.server));
    this.set('add', (courseId, schoolId) => {
      this.set('selectedCourseIds', [...this.selectedCourseIds, courseId]);
      this.set('selectedSchoolIds', [...this.selectedSchoolIds, schoolId]);
    });
    await render(hbs`<Reports::Curriculum::ChooseCourse
  @selectedCourseIds={{this.selectedCourseIds}}
  @selectedSchoolIds={{this.selectedSchoolIds}}
  @schools={{this.schools}}
  @add={{this.add}}
  @remove={{(noop)}}
  @removeAll={{(noop)}}
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
    this.set(
      'selectedSchoolIds',
      courses.map((course) => course.school.id),
    );
    this.set('schools', buildSchoolsFromData(this.server));
    this.set('remove', (courseId, schoolId) => {
      this.set(
        'selectedCourseIds',
        this.selectedCourseIds.filter((id) => id !== courseId),
      );
      this.set(
        'selectedSchoolIds',
        this.selectedSchoolIds.filter((id) => id !== schoolId),
      );
    });
    await render(hbs`<Reports::Curriculum::ChooseCourse
  @selectedCourseIds={{this.selectedCourseIds}}
  @schools={{this.schools}}
  @add={{(noop)}}
  @remove={{this.remove}}
  @removeAll={{(noop)}}
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
