import { currentURL } from '@ember/test-helpers';
import { module, test } from 'qunit';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';
import moment from 'moment';
import page from 'ilios/tests/pages/courses';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Courses', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  hooks.beforeEach(async function() {
    const school = this.server.create('school');
    this.user = await setupAuthentication({ school });
    this.server.create('school');
  });

  test('visiting /courses', async function(assert) {
    await page.visit();
    assert.equal(currentURL(), '/courses');
  });

  test('visiting /courses with title filter', async function(assert) {
    this.server.create('academicYear', {id: 2014});
    this.server.create('course', {
      title: 'specialfirstcourse',
      year: 2014,
      schoolId: 1,
    });
    this.server.create('course', {
      title: 'specialsecondcourse',
      year: 2014,
      schoolId: 1
    });
    this.server.create('course', {
      title: 'regularcourse',
      year: 2014,
      schoolId: 1
    });
    let lastCourse = this.server.create('course', {
      title: 'aaLastcourse',
      year: 2014,
      schoolId: 1
    });
    await page.visit({filter: 'Last'});
    assert.equal(page.courses().count, 1);
    assert.equal(page.courses(0).title, lastCourse.title);
  });

  test('filters by title', async function(assert) {
    this.server.create('academicYear', {id: 2014});
    assert.expect(26);
    let firstCourse = this.server.create('course', {
      title: 'specialfirstcourse',
      year: 2014,
      schoolId: 1,
    });
    let secondCourse = this.server.create('course', {
      title: 'specialsecondcourse',
      year: 2014,
      schoolId: 1
    });
    let regularCourse = this.server.create('course', {
      title: 'regularcourse',
      year: 2014,
      schoolId: 1
    });
    let lastCourse = this.server.create('course', {
      title: 'aaLastcourse',
      year: 2014,
      schoolId: 1
    });
    let regexCourse = this.server.create('course', {
      title: '\\yoo hoo',
      year: 2014,
      schoolId: 1
    });

    this.server.create('course', {
      title: 'archivedCourse',
      year: 2014,
      schoolId: 1,
      archived: true
    });
    await page.visit();
    assert.equal(page.courses().count, 5);
    assert.equal(page.courses(0).title, regexCourse.title);
    assert.equal(page.courses(1).title, lastCourse.title);
    assert.equal(page.courses(2).title, regularCourse.title);
    assert.equal(page.courses(3).title, firstCourse.title);
    assert.equal(page.courses(4).title, secondCourse.title);

    await page.filterByTitle('first');
    assert.equal(page.courses().count, 1);
    assert.equal(page.courses(0).title, firstCourse.title);

    await page.filterByTitle('second');
    assert.equal(page.courses().count, 1);
    assert.equal(page.courses(0).title, secondCourse.title);

    await page.filterByTitle('special');
    assert.equal(page.courses().count, 2);
    assert.equal(page.courses(0).title, firstCourse.title);
    assert.equal(page.courses(1).title, secondCourse.title);

    await page.filterByTitle('course');
    assert.equal(page.courses().count, 4);
    assert.equal(page.courses(0).title, lastCourse.title);
    assert.equal(page.courses(1).title, regularCourse.title);
    assert.equal(page.courses(2).title, firstCourse.title);
    assert.equal(page.courses(3).title, secondCourse.title);

    await page.filterByTitle('');
    assert.equal(page.courses().count, 5);
    assert.equal(page.courses(0).title, regexCourse.title);
    assert.equal(page.courses(1).title, lastCourse.title);
    assert.equal(page.courses(2).title, regularCourse.title);
    assert.equal(page.courses(3).title, firstCourse.title);
    assert.equal(page.courses(4).title, secondCourse.title);

    await page.filterByTitle('\\');
    assert.equal(page.courses().count, 1);
    assert.equal(page.courses(0).title, regexCourse.title);
  });

  test('filters by year', async function(assert) {
    this.server.create('academicYear', {id: 2013});
    this.server.create('academicYear', {id: 2014});
    assert.expect(5);
    let firstCourse = this.server.create('course', {
      year: 2013,
      schoolId: 1,
    });
    let secondCourse = this.server.create('course', {
      year: 2014,
      schoolId: 1
    });
    await page.visit();
    assert.equal(page.courses().count, 1);
    await page.filterByYear('2013 - 2014');
    assert.equal(page.courses().count, 1);
    assert.equal(page.courses(0).title, firstCourse.title);

    await page.filterByYear('2014 - 2015');
    assert.equal(page.courses().count, 1);
    assert.equal(page.courses(0).title, secondCourse.title);
  });

  test('initial filter by year', async function(assert) {
    this.server.create('academicYear', {id: 2013});
    this.server.create('academicYear', {id: 2014});
    assert.expect(4);
    let firstCourse = this.server.create('course', {
      year: 2013,
      schoolId: 1,
    });
    let secondCourse = this.server.create('course', {
      year: 2014,
      schoolId: 1
    });
    await page.visit({ year: 2014 });
    assert.equal(page.courses().count, 1);
    assert.equal(page.courses(0).title, secondCourse.title);

    await page.visit({ year: 2013 });
    assert.equal(page.courses().count, 1);
    assert.equal(page.courses(0).title, firstCourse.title);
  });

  test('filters by mycourses', async function(assert) {
    this.server.create('academicYear', {id: 2014});
    assert.expect(5);
    let firstCourse = this.server.create('course', {
      year: 2014,
      schoolId: 1
    });
    let secondCourse = this.server.create('course', {
      year: 2014,
      schoolId: 1,
      directorIds: [this.user.id]
    });

    await page.visit();
    assert.equal(page.courses().count, 2);
    assert.equal(page.courses(0).title, firstCourse.title);
    assert.equal(page.courses(1).title, secondCourse.title);

    await page.filterByMyCourses();
    assert.equal(page.courses().count, 1);
    assert.equal(page.courses(0).title, secondCourse.title);
  });

  test('year filter options', async function(assert) {
    assert.expect(10);
    this.server.createList('school', 2);
    this.server.create('permission', {
      tableName: 'school',
      tableRowId: 1,
      userId: this.user.id
    });
    this.server.db.users.update(this.user.id, {schoolId: 2});

    this.server.create('academicYear', {id: 2013});
    this.server.create('academicYear', {id: 2014});

    await page.visit();
    assert.equal(page.yearFilters().count, 2);
    assert.equal(page.yearFilters(0).text, '2014 - 2015');
    assert.ok(page.yearFilters(0).selected);
    assert.equal(page.yearFilters(1).text, '2013 - 2014');
    assert.notOk(page.yearFilters(1).selected);

    assert.equal(page.schoolFilters().count, 2);
    assert.equal(page.schoolFilters(0).text, 'school 0');
    assert.notOk(page.schoolFilters(0).selected);
    assert.equal(page.schoolFilters(1).text, 'school 1');
    assert.ok(page.schoolFilters(1).selected);
  });

  test('user can only delete non-published courses with proper privileges', async function(assert) {
    this.server.create('academicYear', {id: 2014});
    assert.expect(4);
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
    this.server.create('course', {
      year: 2014,
      schoolId: 1,
      published: true,
      directorIds: [this.user.id],
    });
    this.server.create('course', {
      year: 2014,
      schoolId: 1,
      published: false,
      directorIds: [this.user.id]
    });
    await page.visit();

    assert.equal(page.courses(0).removeActionCount, 0, 'non-privileged user cannot delete published course');
    assert.equal(page.courses(1).removeActionCount, 0, 'non-privileged user cannot delete unpublished course');
    assert.equal(page.courses(2).removeActionCount, 0, 'privileged user cannot delete published course');
    assert.equal(page.courses(3).removeActionCount, 1, 'privileged user can delete unpublished course');
  });

  test('new course', async function(assert) {
    const year = moment().year();
    this.server.create('academicYear', {id: year});
    assert.expect(5);

    await page.visit({ year });
    await page.toggleNewCourseForm();
    await page.newCourseForm.title('Course 1');
    await page.newCourseForm.chooseYear(year);
    await page.newCourseForm.save();

    assert.equal(page.courses().count, 1);
    assert.equal(page.newCourseLink, 'Course 1', 'new course link');
    assert.equal(page.courses(0).title, 'Course 1', 'course title is correct');
    assert.equal(page.courses(0).school, 'school 0', 'school is correct');
    assert.equal(page.courses(0).year, `${year} - ${year + 1}`, 'year is correct');
  });

  test('new course in another year does not display in list', async function(assert) {
    this.server.create('academicYear', {id: 2012});
    this.server.create('academicYear', {id: 2013});
    assert.expect(1);

    const newTitle = 'new course title, woohoo';

    await page.visit();
    await page.toggleNewCourseForm();
    await page.newCourseForm.title(newTitle);
    await page.newCourseForm.save();
    assert.equal(page.courses().count, 0);
  });

  test('new course does not appear twice when navigating back', async function(assert) {
    const year = moment().year();
    this.server.create('academicYear', {id: year});
    assert.expect(4);

    const courseTitle = "Course 1";

    await page.visit({ year });
    await page.toggleNewCourseForm();
    await page.newCourseForm.title(courseTitle);
    await page.newCourseForm.chooseYear(year);
    await page.newCourseForm.save();

    assert.equal(page.courses().count, 1);
    assert.equal(page.newCourseLink, 'Course 1');
    await page.visitNewCourse();
    await page.visit({ year });

    assert.equal(page.courses().count, 1);
    assert.equal(page.newCourseLink, 'Course 1');
  });

  test('new course can be deleted', async function(assert) {
    const year = moment().year();
    this.server.create('academicYear', {id: year});
    this.server.create('userRole', {
      title: 'Developer'
    });
    this.server.db.users.update(this.user.id, {roleIds: [1]});

    assert.expect(9);

    await page.visit({ year });
    assert.equal(page.courses().count, 0);
    assert.equal(page.savedCoursesCount, 0);
    await page.toggleNewCourseForm();
    await page.newCourseForm.title('Course 1');
    await page.newCourseForm.chooseYear(year);
    await page.newCourseForm.save();

    assert.equal(page.courses().count, 1);
    assert.equal(page.newCourseLink, 'Course 1');
    await page.visitNewCourse();
    await page.visit({ year });

    assert.equal(page.courses().count, 1);
    assert.equal(page.savedCoursesCount, 1);
    assert.equal(page.newCourseLink, 'Course 1');
    await page.courses(0).remove();
    await page.confirmCourseRemoval();
    assert.equal(page.courses().count, 0);
    assert.equal(page.savedCoursesCount, 0);
  });

  test('locked courses', async function(assert) {
    this.server.create('academicYear', {id: 2014});
    assert.expect(7);
    this.server.create('course', {
      year: 2014,
      schoolId: 1
    });
    this.server.create('course', {
      year: 2014,
      schoolId: 1,
      locked: true
    });

    await page.visit({ year: 2014 });
    assert.equal(page.courses().count, 2);
    assert.equal(page.courses(0).title, 'course 0', 'course name is correct');
    assert.equal(page.courses(0).status, 'Not Published', 'course status is correct');
    assert.notOk(page.courses(0).isLocked, 'course is not locked');

    assert.equal(page.courses(1).title, 'course 1', 'course name is correct');
    assert.equal(page.courses(1).status, 'Not Published', 'course status is correct');
    assert.ok(page.courses(1).isLocked, 'course is locked');
  });

  test('no academic years exist', async function(assert) {
    assert.expect(6);

    await page.visit();
    await page.toggleNewCourseForm();

    let thisYear = parseInt(moment().format('YYYY'), 10);
    let years = [
      thisYear-2,
      thisYear-1,
      thisYear,
      thisYear+1,
      thisYear+2
    ];


    assert.equal(page.newCourseForm.years().count, years.length);
    for (let i = 0; i < years.length; i++){
      assert.equal(page.newCourseForm.years(i).text.substring(0,4), years[i]);
    }
  });

  test('sort by title', async function(assert) {
    this.server.create('academicYear', {id: 2014});
    assert.expect(6);
    let firstCourse = this.server.create('course', {
      year: 2014,
      schoolId: 1
    });
    let secondCourse = this.server.create('course', {
      year: 2014,
      schoolId: 1,
    });
    await page.visit();
    assert.equal(page.courses().count, 2);
    assert.equal(page.courses(0).title, firstCourse.title);
    assert.equal(page.courses(1).title, secondCourse.title);
    await page.sortByTitle();
    assert.equal(page.courses().count, 2);
    assert.equal(page.courses(0).title, secondCourse.title);
    assert.equal(page.courses(1).title, firstCourse.title);
  });

  test('sort by level', async function(assert) {
    this.server.create('academicYear', {id: 2014});
    assert.expect(6);
    let firstCourse = this.server.create('course', {
      year: 2014,
      schoolId: 1,
      level: 1
    });
    let secondCourse = this.server.create('course', {
      year: 2014,
      schoolId: 1,
      level: 2
    });

    await page.visit();
    await page.sortByLevel();
    assert.equal(page.courses().count, 2);
    assert.equal(page.courses(0).title, firstCourse.title);
    assert.equal(page.courses(1).title, secondCourse.title);
    await page.sortByLevel();
    assert.equal(page.courses().count, 2);
    assert.equal(page.courses(0).title, secondCourse.title);
    assert.equal(page.courses(1).title, firstCourse.title);
  });

  test('sort by startDate', async function(assert) {
    this.server.create('academicYear', {id: 2014});
    assert.expect(6);
    let firstCourse = this.server.create('course', {
      year: 2014,
      schoolId: 1,
      startDate: moment().toDate()
    });
    let secondCourse = this.server.create('course', {
      year: 2014,
      schoolId: 1,
      startDate: moment().add(1, 'day').toDate()
    });

    await page.visit();
    await page.sortByStartDate();
    assert.equal(page.courses().count, 2);
    assert.equal(page.courses(0).title, firstCourse.title);
    assert.equal(page.courses(1).title, secondCourse.title);
    await page.sortByStartDate();
    assert.equal(page.courses().count, 2);
    assert.equal(page.courses(0).title, secondCourse.title);
    assert.equal(page.courses(1).title, firstCourse.title);
  });

  test('sort by endDate', async function(assert) {
    this.server.create('academicYear', {id: 2014});
    assert.expect(6);
    let firstCourse = this.server.create('course', {
      year: 2014,
      schoolId: 1,
      endDate: moment().toDate()
    });
    let secondCourse = this.server.create('course', {
      year: 2014,
      schoolId: 1,
      endDate: moment().add(1, 'day').toDate()
    });

    await page.visit();
    await page.sortByEndDate();
    assert.equal(page.courses().count, 2);
    assert.equal(page.courses(0).title, firstCourse.title);
    assert.equal(page.courses(1).title, secondCourse.title);
    await page.sortByEndDate();
    assert.equal(page.courses().count, 2);
    assert.equal(page.courses(0).title, secondCourse.title);
    assert.equal(page.courses(1).title, firstCourse.title);
  });

  test('sort by status', async function(assert) {
    this.server.create('academicYear', {id: 2014});
    assert.expect(8);
    let firstCourse = this.server.create('course', {
      year: 2014,
      schoolId: 1,
      published: true,
      publishedAsTbd: false
    });
    let secondCourse = this.server.create('course', {
      year: 2014,
      schoolId: 1,
      published: true,
      publishedAsTbd: true
    });
    let thirdCourse = this.server.create('course', {
      year: 2014,
      schoolId: 1,
      published: false,
      publishedAsTbd: false
    });

    await page.visit();
    await page.sortByStatus();
    assert.equal(page.courses().count, 3);
    assert.equal(page.courses(0).title, thirdCourse.title);
    assert.equal(page.courses(1).title, firstCourse.title);
    assert.equal(page.courses(2).title, secondCourse.title);
    await page.sortByStatus();
    assert.equal(page.courses().count, 3);
    assert.equal(page.courses(0).title, secondCourse.title);
    assert.equal(page.courses(1).title, firstCourse.title);
    assert.equal(page.courses(2).title, thirdCourse.title);
  });

  test('developer users can lock and unlock course', async function(assert) {
    assert.expect(5);
    this.server.create('academicYear', {id: 2014});
    this.server.create('userRole', {
      title: 'Developer'
    });
    this.server.db.users.update(this.user.id, {roleIds: [1]});
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
    assert.equal(page.courses().count, 2);
    assert.ok(page.courses(0).isLocked, 'first course is locked');
    assert.ok(page.courses(1).isUnlocked, 'second course is unlocked');
    await page.courses(0).unLock();
    await page.courses(1).lock();
    assert.ok(page.courses(0).isUnlocked, 'first course is now unlocked');
    assert.ok(page.courses(1).isLocked, 'second course is now locked');
  });

  test('course directors users can lock but not unlock course', async function(assert) {
    assert.expect(5);
    this.server.create('academicYear', {id: 2014});
    this.server.create('course', {
      year: 2014,
      schoolId: 1,
      published: true,
      publishedAsTbd: false,
      locked: true,
      directorIds: [this.user.id],
    });
    this.server.create('course', {
      year: 2014,
      schoolId: 1,
      published: true,
      publishedAsTbd: true,
      locked: false,
      directorIds: [this.user.id],
    });


    await page.visit();
    assert.equal(page.courses().count, 2);
    assert.ok(page.courses(0).isLocked, 'first course is locked');
    assert.ok(page.courses(1).isUnlocked, 'second course is unlocked');
    await page.courses(0).unLock();
    await page.courses(1).lock();
    assert.ok(page.courses(0).isLocked, 'first course is still locked');
    assert.ok(page.courses(1).isLocked, 'second course is now locked');
  });

  test('non-privileged users cannot lock and unlock course but can see the icon', async function(assert) {
    assert.expect(5);
    this.server.create('academicYear', {id: 2014});
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
    assert.equal(page.courses().count, 2);
    assert.ok(page.courses(0).isLocked, 'first course is locked');
    assert.ok(page.courses(1).isUnlocked, 'second course is unlocked');
    await page.courses(0).unLock();
    await page.courses(1).lock();
    assert.ok(page.courses(0).isLocked, 'first course is still locked');
    assert.ok(page.courses(1).isUnlocked, 'second course is still unlocked');
  });

  test('title filter escapes regex', async function(assert) {
    this.server.create('academicYear', {id: 2014});
    assert.expect(4);
    let firstCourse = this.server.create('course', {
      title: 'yes\\no',
      year: 2014,
      schoolId: 1,
    });

    await page.visit();
    assert.equal(page.courses().count, 1);
    assert.equal(page.courses(0).title, firstCourse.title);

    await page.filterByTitle('\\');

    assert.equal(page.courses().count, 1);
    assert.equal(page.courses(0).title, firstCourse.title);
  });
});
