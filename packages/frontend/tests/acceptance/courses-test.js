import { currentURL } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupAuthentication, freezeDateAt, unfreezeDate } from 'ilios-common';
import { DateTime } from 'luxon';
import page from 'frontend/tests/pages/courses';
import { setupApplicationTest } from 'frontend/tests/helpers';
import percySnapshot from '@percy/ember';
import { getUniqueName } from '../helpers/percy-snapshot-name';

module('Acceptance | Courses', function (hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(async function () {
    this.school = this.server.create('school');
    this.user = await setupAuthentication({ school: this.school }, true);
    this.server.create('school');
  });

  test('visiting /courses', async function (assert) {
    await page.visit();
    await percySnapshot(assert);
    assert.strictEqual(currentURL(), '/courses');
  });

  test('visiting /courses with title filter', async function (assert) {
    this.server.create('academic-year', { id: 2014 });
    this.server.create('course', {
      title: 'specialfirstcourse',
      year: 2014,
      schoolId: 1,
    });
    this.server.create('course', {
      title: 'specialsecondcourse',
      year: 2014,
      schoolId: 1,
    });
    this.server.create('course', {
      title: 'regularcourse',
      year: 2014,
      schoolId: 1,
    });
    const lastCourse = this.server.create('course', {
      title: 'aaLastcourse',
      year: 2014,
      schoolId: 1,
    });
    await page.visit({ filter: 'Last' });
    assert.strictEqual(page.root.list.courses.length, 1);
    assert.strictEqual(page.root.list.courses[0].title, lastCourse.title);
    assert.strictEqual(page.root.headerTitle, 'Courses (1)');
  });

  test('filters by title', async function (assert) {
    this.server.create('academic-year', { id: 2014 });
    const firstCourse = this.server.create('course', {
      title: 'specialfirstcourse',
      year: 2014,
      schoolId: 1,
    });
    const secondCourse = this.server.create('course', {
      title: 'specialsecondcourse',
      year: 2014,
      schoolId: 1,
    });
    const regularCourse = this.server.create('course', {
      title: 'regularcourse',
      year: 2014,
      schoolId: 1,
    });
    const lastCourse = this.server.create('course', {
      title: 'aaLastcourse',
      year: 2014,
      schoolId: 1,
    });
    const regexCourse = this.server.create('course', {
      title: '\\yoo hoo',
      year: 2014,
      schoolId: 1,
    });

    this.server.create('course', {
      title: 'archivedCourse',
      year: 2014,
      schoolId: 1,
      archived: true,
    });
    await page.visit();
    await percySnapshot(getUniqueName(assert, 'default'));
    assert.strictEqual(page.root.list.courses.length, 5);
    assert.strictEqual(page.root.list.courses[0].title, regexCourse.title);
    assert.strictEqual(page.root.list.courses[1].title, lastCourse.title);
    assert.strictEqual(page.root.list.courses[2].title, regularCourse.title);
    assert.strictEqual(page.root.list.courses[3].title, firstCourse.title);
    assert.strictEqual(page.root.list.courses[4].title, secondCourse.title);

    await page.root.filterByTitle('first');
    assert.strictEqual(page.root.list.courses.length, 1);
    assert.strictEqual(page.root.list.courses[0].title, firstCourse.title);
    assert.strictEqual(page.root.headerTitle, 'Courses (1)');

    await page.root.filterByTitle('  first  ');
    assert.strictEqual(page.root.list.courses.length, 1);
    assert.strictEqual(page.root.list.courses[0].title, firstCourse.title);
    assert.strictEqual(page.root.headerTitle, 'Courses (1)');

    await page.root.filterByTitle('second');
    assert.strictEqual(page.root.list.courses.length, 1);
    assert.strictEqual(page.root.list.courses[0].title, secondCourse.title);
    assert.strictEqual(page.root.headerTitle, 'Courses (1)');

    await page.root.filterByTitle('special');
    assert.strictEqual(page.root.list.courses.length, 2);
    assert.strictEqual(page.root.list.courses[0].title, firstCourse.title);
    assert.strictEqual(page.root.list.courses[1].title, secondCourse.title);
    assert.strictEqual(page.root.headerTitle, 'Courses (2)');

    await page.root.filterByTitle('course');
    await percySnapshot(getUniqueName(assert, 'filterByTitle'));
    assert.strictEqual(page.root.list.courses.length, 4);
    assert.strictEqual(page.root.list.courses[0].title, lastCourse.title);
    assert.strictEqual(page.root.list.courses[1].title, regularCourse.title);
    assert.strictEqual(page.root.list.courses[2].title, firstCourse.title);
    assert.strictEqual(page.root.list.courses[3].title, secondCourse.title);
    assert.strictEqual(page.root.headerTitle, 'Courses (4)');

    await page.root.filterByTitle('');
    assert.strictEqual(page.root.list.courses.length, 5);
    assert.strictEqual(page.root.list.courses[0].title, regexCourse.title);
    assert.strictEqual(page.root.list.courses[1].title, lastCourse.title);
    assert.strictEqual(page.root.list.courses[2].title, regularCourse.title);
    assert.strictEqual(page.root.list.courses[3].title, firstCourse.title);
    assert.strictEqual(page.root.list.courses[4].title, secondCourse.title);
    assert.strictEqual(page.root.headerTitle, 'Courses (5)');

    await page.root.filterByTitle('\\');
    assert.strictEqual(page.root.list.courses.length, 1);
    assert.strictEqual(page.root.list.courses[0].title, regexCourse.title);
    assert.strictEqual(page.root.headerTitle, 'Courses (1)');
  });

  test('filters by year', async function (assert) {
    this.server.create('academic-year', { id: 2013 });
    this.server.create('academic-year', { id: 2014 });
    const firstCourse = this.server.create('course', {
      year: 2013,
      schoolId: 1,
    });
    const secondCourse = this.server.create('course', {
      year: 2014,
      schoolId: 1,
    });
    await page.visit();
    assert.strictEqual(page.root.list.courses.length, 1);
    await page.root.filterByYear('2013');
    assert.strictEqual(page.root.list.courses.length, 1);
    assert.strictEqual(page.root.list.courses[0].title, firstCourse.title);

    await page.root.filterByYear('2014');
    assert.strictEqual(page.root.list.courses.length, 1);
    assert.strictEqual(page.root.list.courses[0].title, secondCourse.title);
  });

  test('initial filter by year', async function (assert) {
    this.server.create('academic-year', { id: 2013 });
    this.server.create('academic-year', { id: 2014 });
    const firstCourse = this.server.create('course', {
      year: 2013,
      schoolId: 1,
    });
    const secondCourse = this.server.create('course', {
      year: 2014,
      schoolId: 1,
    });
    await page.visit({ year: 2014 });
    assert.strictEqual(page.root.list.courses.length, 1);
    assert.strictEqual(page.root.list.courses[0].title, secondCourse.title);

    await page.visit({ year: 2013 });
    assert.strictEqual(page.root.list.courses.length, 1);
    assert.strictEqual(page.root.list.courses[0].title, firstCourse.title);
  });

  test('filters by mycourses', async function (assert) {
    this.server.create('academic-year', { id: 2014 });
    const firstCourse = this.server.create('course', {
      year: 2014,
      schoolId: 1,
    });
    const secondCourse = this.server.create('course', {
      year: 2014,
      schoolId: 1,
      directorIds: [this.user.id],
    });

    await page.visit();
    assert.strictEqual(page.root.list.courses.length, 2);
    assert.strictEqual(page.root.list.courses[0].title, firstCourse.title);
    assert.strictEqual(page.root.list.courses[1].title, secondCourse.title);

    await page.root.filterByMyCourses();
    assert.strictEqual(page.root.list.courses.length, 1);
    assert.strictEqual(page.root.list.courses[0].title, secondCourse.title);
  });

  test('year filter options', async function (assert) {
    this.server.createList('school', 2);
    this.server.db.users.update(this.user.id, { schoolId: 2 });

    this.server.create('academic-year', { id: 2013 });
    this.server.create('academic-year', { id: 2014 });

    await page.visit();
    assert.strictEqual(page.root.yearFilters.length, 2);
    assert.strictEqual(page.root.yearFilters[0].text, '2014 - 2015');
    assert.ok(page.root.yearFilters[0].selected);
    assert.strictEqual(page.root.yearFilters[1].text, '2013 - 2014');
    assert.notOk(page.root.yearFilters[1].selected);

    assert.strictEqual(page.root.schoolFilters.length, 4);
    assert.strictEqual(page.root.schoolFilters[0].text, 'school 0');
    assert.notOk(page.root.schoolFilters[0].selected);
    assert.strictEqual(page.root.schoolFilters[1].text, 'school 1');
    assert.ok(page.root.schoolFilters[1].selected);
    assert.strictEqual(page.root.schoolFilters[2].text, 'school 2');
    assert.notOk(page.root.schoolFilters[2].selected);
    assert.strictEqual(page.root.schoolFilters[3].text, 'school 3');
    assert.notOk(page.root.schoolFilters[3].selected);
  });

  test('unprivileged users can not delete courses', async function (assert) {
    this.server.create('academic-year', { id: 2014 });
    this.server.create('course', {
      year: 2014,
      schoolId: 1,
      published: true,
    });
    this.server.create('course', {
      year: 2014,
      schoolId: 1,
      published: false,
    });
    await page.visit();

    assert.notOk(
      page.root.list.courses[0].canRemove,
      'non-privileged user cannot delete published course',
    );
    assert.notOk(
      page.root.list.courses[1].canRemove,
      'non-privileged user cannot delete unpublished course',
    );
  });

  test('privileged users can only delete unpublished courses', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    this.server.create('academic-year', { id: 2014 });
    this.server.create('course', {
      year: 2014,
      schoolId: 1,
      published: true,
    });
    this.server.create('course', {
      year: 2014,
      schoolId: 1,
      published: false,
    });
    await page.visit();

    assert.notOk(
      page.root.list.courses[0].canRemove,
      'privileged user cannot delete published course',
    );
    assert.ok(page.root.list.courses[1].canRemove, 'privileged user can delete unpublished course');
  });

  test('new course', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    const year = DateTime.now().year;
    this.server.create('academic-year', { id: year });
    await page.visit({ year });
    await page.root.toggleNewCourseForm();
    await page.root.newCourse.title('Course 1');
    await page.root.newCourse.chooseYear(year);
    await page.root.newCourse.save();
    assert.strictEqual(page.root.list.courses.length, 1);
    assert.strictEqual(page.root.newCourseLink, 'Course 1', 'new course link');
    assert.strictEqual(page.root.list.courses[0].title, 'Course 1', 'course title is correct');
  });

  test('new course toggle does not show up for unprivileged users', async function (assert) {
    const year = DateTime.now().year;
    this.server.create('academic-year', { id: year });
    await page.visit({ year });
    assert.notOk(page.root.toggleNewCourseFormExists);
  });

  test('new course in another year does not display in list', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    this.server.create('academic-year', { id: 2012 });
    this.server.create('academic-year', { id: 2013 });

    const newTitle = 'new course title, woohoo';

    await page.visit();
    await page.root.toggleNewCourseForm();
    await page.root.newCourse.chooseYear(new Date().getFullYear() - 1);
    await page.root.newCourse.title(newTitle);
    await page.root.newCourse.save();
    assert.strictEqual(page.root.list.courses.length, 0);
    assert.notOk(page.root.list.listIsVisible);
  });

  test('new course does not appear twice when navigating back', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    const year = DateTime.now().year;
    this.server.create('academic-year', { id: year });

    const courseTitle = 'Course 1';

    await page.visit({ year });
    await page.root.toggleNewCourseForm();
    await page.root.newCourse.title(courseTitle);
    await page.root.newCourse.chooseYear(year);
    await page.root.newCourse.save();
    assert.strictEqual(page.root.list.courses.length, 1);
    assert.strictEqual(page.root.newCourseLink, 'Course 1');

    await page.root.visitNewCourse();
    await page.visit({ year });
    assert.strictEqual(page.root.list.courses.length, 1);
    assert.ok(page.root.newCourseLinkIsHidden);
  });

  test('new course can be deleted', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    const year = DateTime.now().year;
    this.server.create('academic-year', { id: year });
    this.server.create('userRole', {
      title: 'Developer',
    });
    this.server.db.users.update(this.user.id, { roleIds: [1] });

    await page.visit({ year });
    assert.strictEqual(page.root.list.courses.length, 0);
    assert.notOk(page.root.list.listIsVisible);

    await page.root.toggleNewCourseForm();
    await page.root.newCourse.title('Course 1');
    await page.root.newCourse.chooseYear(year);
    await page.root.newCourse.save();
    assert.strictEqual(page.root.list.courses.length, 1);
    assert.strictEqual(page.root.newCourseLink, 'Course 1');

    await page.root.visitNewCourse();
    await page.visit({ year });
    assert.strictEqual(page.root.list.courses.length, 1);
    assert.ok(page.root.newCourseLinkIsHidden);

    await page.root.list.courses[0].remove();
    await page.root.list.confirmCourseRemoval();
    assert.strictEqual(page.root.list.courses.length, 0);
    assert.notOk(page.root.list.listIsVisible);
  });

  test('locked courses', async function (assert) {
    this.server.create('academic-year', { id: 2014 });
    this.server.create('course', {
      year: 2014,
      schoolId: 1,
    });
    this.server.create('course', {
      year: 2014,
      schoolId: 1,
      locked: true,
    });

    await page.visit({ year: 2014 });
    assert.strictEqual(page.root.list.courses.length, 2);
    assert.strictEqual(page.root.list.courses[0].title, 'course 0', 'course name is correct');
    assert.strictEqual(
      page.root.list.courses[0].publicationStatus.icon.title,
      'Not Published',
      'course status is correct',
    );
    assert.notOk(page.root.list.courses[0].isLocked, 'course is not locked');
    assert.strictEqual(page.root.list.courses[1].title, 'course 1', 'course name is correct');
    assert.strictEqual(
      page.root.list.courses[1].publicationStatus.icon.title,
      'Not Published',
      'course status is correct',
    );
    assert.ok(page.root.list.courses[1].isLocked, 'course is locked');
  });

  test('no academic years exist', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });

    await page.visit();
    await page.root.toggleNewCourseForm();

    const thisYear = DateTime.now().year;
    const years = [thisYear - 2, thisYear - 1, thisYear, thisYear + 1, thisYear + 2];

    assert.strictEqual(page.root.newCourse.years.length, years.length + 1);
    assert.strictEqual(page.root.newCourse.years[0].text, 'Select Academic Year');
    for (let i = 0; i < years.length; i++) {
      assert.strictEqual(
        parseInt(page.root.newCourse.years[i + 1].text.substring(0, 4), 10),
        years[i],
      );
    }
  });

  test('sort by title', async function (assert) {
    this.server.create('academic-year', { id: 2014 });
    const firstCourse = this.server.create('course', {
      year: 2014,
      schoolId: 1,
    });
    const secondCourse = this.server.create('course', {
      year: 2014,
      schoolId: 1,
    });
    await page.visit();
    assert.ok(page.root.list.isSortedByTitleAscending);
    assert.strictEqual(page.root.list.courses.length, 2);
    assert.strictEqual(page.root.list.courses[0].title, firstCourse.title);
    assert.strictEqual(page.root.list.courses[1].title, secondCourse.title);
    await page.root.list.sortByTitle();
    assert.ok(page.root.list.isSortedByTitleDescending);
    assert.strictEqual(page.root.list.courses[0].title, secondCourse.title);
    assert.strictEqual(page.root.list.courses[1].title, firstCourse.title);
  });

  test('sort by level', async function (assert) {
    this.server.create('academic-year', { id: 2014 });
    const firstCourse = this.server.create('course', {
      year: 2014,
      schoolId: 1,
      level: 1,
    });
    const secondCourse = this.server.create('course', {
      year: 2014,
      schoolId: 1,
      level: 2,
    });

    await page.visit();
    await page.root.list.sortByLevel();
    assert.ok(page.root.list.isSortedByLevelAscending);
    assert.strictEqual(page.root.list.courses.length, 2);
    assert.strictEqual(page.root.list.courses[0].title, firstCourse.title);
    assert.strictEqual(page.root.list.courses[1].title, secondCourse.title);
    await page.root.list.sortByLevel();
    assert.ok(page.root.list.isSortedByLevelDescending);
    assert.strictEqual(page.root.list.courses[0].title, secondCourse.title);
    assert.strictEqual(page.root.list.courses[1].title, firstCourse.title);
  });

  test('sort by startDate', async function (assert) {
    this.server.create('academic-year', { id: 2014 });
    const firstCourse = this.server.create('course', {
      year: 2014,
      schoolId: 1,
      startDate: DateTime.fromObject({ hour: 8 }).toJSDate(),
    });
    const secondCourse = this.server.create('course', {
      year: 2014,
      schoolId: 1,
      startDate: DateTime.fromObject({ hour: 8 }).plus({ days: 1 }).toJSDate(),
    });

    await page.visit();
    await page.root.list.sortByStartDate();
    assert.ok(page.root.list.isSortedByStartDateAscending);
    assert.strictEqual(page.root.list.courses.length, 2);
    assert.strictEqual(page.root.list.courses[0].title, firstCourse.title);
    assert.strictEqual(page.root.list.courses[1].title, secondCourse.title);
    await page.root.list.sortByStartDate();
    assert.ok(page.root.list.isSortedByStartDateDescending);
    assert.strictEqual(page.root.list.courses[0].title, secondCourse.title);
    assert.strictEqual(page.root.list.courses[1].title, firstCourse.title);
  });

  test('sort by endDate', async function (assert) {
    this.server.create('academic-year', { id: 2014 });
    const firstCourse = this.server.create('course', {
      year: 2014,
      schoolId: 1,
      endDate: DateTime.fromObject({ hour: 8 }).toJSDate(),
    });
    const secondCourse = this.server.create('course', {
      year: 2014,
      schoolId: 1,
      endDate: DateTime.fromObject({ hour: 8 }).plus({ days: 1 }).toJSDate(),
    });

    await page.visit();
    await page.root.list.sortByEndDate();
    assert.ok(page.root.list.isSortedByEndDateAscending);
    assert.strictEqual(page.root.list.courses.length, 2);
    assert.strictEqual(page.root.list.courses[0].title, firstCourse.title);
    assert.strictEqual(page.root.list.courses[1].title, secondCourse.title);
    await page.root.list.sortByEndDate();
    assert.ok(page.root.list.isSortedByEndDateDescending);
    assert.strictEqual(page.root.list.courses[0].title, secondCourse.title);
    assert.strictEqual(page.root.list.courses[1].title, firstCourse.title);
  });

  test('sort by status', async function (assert) {
    this.server.create('academic-year', { id: 2014 });
    const firstCourse = this.server.create('course', {
      year: 2014,
      schoolId: 1,
      published: true,
      publishedAsTbd: false,
    });
    const secondCourse = this.server.create('course', {
      year: 2014,
      schoolId: 1,
      published: true,
      publishedAsTbd: true,
    });
    const thirdCourse = this.server.create('course', {
      year: 2014,
      schoolId: 1,
      published: false,
      publishedAsTbd: false,
    });

    await page.visit();
    await page.root.list.sortByStatus();
    assert.ok(page.root.list.isSortedByStatusAscending);
    assert.strictEqual(page.root.list.courses.length, 3);
    assert.strictEqual(page.root.list.courses[0].title, thirdCourse.title);
    assert.strictEqual(page.root.list.courses[1].title, firstCourse.title);
    assert.strictEqual(page.root.list.courses[2].title, secondCourse.title);
    await page.root.list.sortByStatus();
    assert.ok(page.root.list.isSortedByStatusDescending);
    assert.strictEqual(page.root.list.courses[0].title, secondCourse.title);
    assert.strictEqual(page.root.list.courses[1].title, firstCourse.title);
    assert.strictEqual(page.root.list.courses[2].title, thirdCourse.title);
  });

  test('privileged users can lock and unlock course', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    this.server.create('academic-year', { id: 2014 });
    this.server.create('course', {
      year: 2014,
      schoolId: 1,
      published: true,
      publishedAsTbd: false,
      locked: true,
    });
    this.server.create('course', {
      year: 2014,
      schoolId: 1,
      published: true,
      publishedAsTbd: true,
      locked: false,
    });

    await page.visit();
    assert.strictEqual(page.root.list.courses.length, 2);
    assert.ok(page.root.list.courses[0].isLocked, 'first course is locked');
    assert.ok(page.root.list.courses[1].isUnlocked, 'second course is unlocked');
    await page.root.list.courses[0].unLock();
    await page.root.list.courses[1].lock();
    assert.ok(page.root.list.courses[0].isUnlocked, 'first course is now unlocked');
    assert.ok(page.root.list.courses[1].isLocked, 'second course is now locked');
  });

  test('non-privileged users cannot lock and unlock course but can see the icon', async function (assert) {
    this.server.create('academic-year', { id: 2014 });
    this.server.create('course', {
      year: 2014,
      schoolId: 1,
      published: true,
      publishedAsTbd: false,
      locked: true,
    });
    this.server.create('course', {
      year: 2014,
      schoolId: 1,
      published: true,
      publishedAsTbd: true,
      locked: false,
    });

    await page.visit();
    assert.strictEqual(page.root.list.courses.length, 2);
    assert.ok(page.root.list.courses[0].isLocked, 'first course is locked');
    assert.ok(page.root.list.courses[1].isUnlocked, 'second course is unlocked');
    assert.notOk(page.root.list.courses[0].canLock);
    assert.notOk(page.root.list.courses[1].canUnlock);
  });

  test('title filter escapes regex', async function (assert) {
    this.server.create('academic-year', { id: 2014 });
    const firstCourse = this.server.create('course', {
      title: 'yes\\no',
      year: 2014,
      schoolId: 1,
    });

    await page.visit();
    assert.strictEqual(page.root.list.courses.length, 1);
    assert.strictEqual(page.root.list.courses[0].title, firstCourse.title);

    await page.root.filterByTitle('\\');

    assert.strictEqual(page.root.list.courses.length, 1);
    assert.strictEqual(page.root.list.courses[0].title, firstCourse.title);
  });

  test('can not delete course with descendants #3620', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    const year = DateTime.now().year.toString();
    this.server.create('academic-year', { id: year });
    const course1 = this.server.create('course', {
      year,
      school: this.school,
    });
    this.server.create('course', {
      year,
      school: this.school,
      ancestor: course1,
    });

    await page.visit({ year });

    assert.notOk(
      page.root.list.courses[0].canRemove,
      'privileged user cannot delete course with descendants',
    );
    assert.ok(
      page.root.list.courses[1].canRemove,
      'privileged user can delete course with ancestors',
    );
  });

  test('academic year pre-selects last year with calendar-year-boundary-crossing config turned on', async function (assert) {
    const { apiVersion } = this.owner.resolveRegistration('config:environment');
    this.user.update({ administeredSchools: [this.school] });
    freezeDateAt(new Date('1/1/2021'));
    const year = DateTime.now().year;
    this.server.create('academic-year', { id: year - 1 });
    this.server.create('academic-year', { id: year });
    this.server.get('application/config', function () {
      assert.step('API called');
      return {
        config: {
          academicYearCrossesCalendarYearBoundaries: true,
          apiVersion,
        },
      };
    });
    await page.visit();
    assert.ok(page.root.yearFilters[1].selected);
    assert.strictEqual(page.root.yearFilters[1].value, (year - 1).toString());
    unfreezeDate();
    assert.verifySteps(['API called']);
  });

  test('academic year pre-selects this year with calendar-year-boundary-crossing config turned on', async function (assert) {
    const { apiVersion } = this.owner.resolveRegistration('config:environment');
    this.user.update({ administeredSchools: [this.school] });
    freezeDateAt(new Date('10/10/2021'));
    const year = DateTime.now().year;
    this.server.create('academic-year', { id: year - 1 });
    this.server.create('academic-year', { id: year });
    this.server.get('application/config', function () {
      assert.step('API called');
      return {
        config: {
          academicYearCrossesCalendarYearBoundaries: true,
          apiVersion,
        },
      };
    });
    await page.visit();
    assert.ok(page.root.yearFilters[0].selected);
    assert.strictEqual(page.root.yearFilters[0].value, year.toString());
    unfreezeDate();
    assert.verifySteps(['API called']);
  });

  test('academic year always pre-selects this year with calendar-year-boundary-crossing config turned off', async function (assert) {
    const { apiVersion } = this.owner.resolveRegistration('config:environment');
    this.user.update({ administeredSchools: [this.school] });
    freezeDateAt(new Date('1/1/2021'));
    const year = DateTime.now().year;
    this.server.create('academic-year', { id: year - 1 });
    this.server.create('academic-year', { id: year });
    this.server.get('application/config', function () {
      assert.step('API called');
      return {
        config: {
          academicYearCrossesCalendarYearBoundaries: false,
          apiVersion,
        },
      };
    });
    await page.visit();
    assert.ok(page.root.yearFilters[0].selected);
    assert.strictEqual(page.root.yearFilters[0].value, year.toString());
    unfreezeDate();
    assert.verifySteps(['API called']);
  });

  test('academic STILL always year pre-selects this year with calendar-year-boundary-crossing config turned off', async function (assert) {
    const { apiVersion } = this.owner.resolveRegistration('config:environment');
    this.user.update({ administeredSchools: [this.school] });
    freezeDateAt(new Date('10/10/2021'));
    const year = DateTime.now().year;
    this.server.create('academic-year', { id: year - 1 });
    this.server.create('academic-year', { id: year });
    this.server.get('application/config', function () {
      assert.step('API called');
      return {
        config: {
          academicYearCrossesCalendarYearBoundaries: false,
          apiVersion,
        },
      };
    });
    await page.visit();
    assert.ok(page.root.yearFilters[0].selected);
    assert.strictEqual(page.root.yearFilters[0].value, year.toString());
    unfreezeDate();
    assert.verifySteps(['API called']);
  });

  test('title filter does not lose focus #6417', async function (assert) {
    this.server.create('academic-year', { id: 2014 });
    this.server.create('course', {
      year: 2014,
      school: this.school,
    });
    await page.visit();
    assert.strictEqual(page.root.list.courses.length, 1);

    assert.notOk(page.root.filterHasFocus);
    await page.root.filterByTitle('first');
    assert.ok(page.root.filterHasFocus);
  });
});
