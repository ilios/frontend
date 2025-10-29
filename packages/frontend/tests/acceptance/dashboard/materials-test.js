import { DateTime } from 'luxon';
import { module, test } from 'qunit';
import { setupAuthentication, freezeDateAt, unfreezeDate } from 'ilios-common';
import { setupApplicationTest } from 'frontend/tests/helpers';
import { a11yAudit } from 'ember-a11y-testing/test-support';
import page from 'ilios-common/page-objects/dashboard-materials';
import percySnapshot from '@percy/ember';
import { getUniqueName } from '../../helpers/percy-snapshot-name';

module('Acceptance | Dashboard Materials', function (hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(async function () {
    freezeDateAt(
      DateTime.fromObject({
        month: 11,
        day: 5,
      }).toJSDate(),
    );
    this.school = this.server.create('school');
    this.user = await setupAuthentication({ school: this.school });

    const today = DateTime.now();
    const tomorrow = today.plus({ day: 1 });
    const nextWeek = today.plus({ week: 1 });
    const courses = [
      this.server.create('course', {
        externalId: 'ID1234',
        year: 2021,
      }),
      ...this.server.createList('course', 4, {
        year: 2022,
      }),
    ];
    const lm1 = {
      title: 'title1',
      absoluteFileUri: 'http://myhost.com/url1',
      sessionTitle: 'session1title',
      sessionLearningMaterial: 1,
      course: courses[0].id,
      mimetype: 'application/pdf',
      courseTitle: courses[0].title,
      courseYear: courses[0].year,
      courseExternalId: courses[0].externalId,
      instructors: ['Instructor1name', 'Instructor2name'],
      firstOfferingDate: today.toJSDate(),
    };
    const lm2 = {
      title: 'title2',
      link: 'http://myhost.com/url2',
      sessionTitle: 'session2title',
      sessionLearningMaterial: 2,
      course: courses[1].id,
      courseTitle: courses[1].title,
      courseYear: courses[1].year,
      courseExternalId: courses[1].externalId,
      instructors: ['Instructor1name', 'Instructor2name'],
      firstOfferingDate: tomorrow.toJSDate(),
    };
    const lm3 = {
      title: 'title3',
      citation: 'citationtext',
      sessionTitle: 'session3title',
      sessionLearningMaterial: 3,
      course: courses[2].id,
      courseYear: courses[2].year,
      courseTitle: courses[2].title,
      firstOfferingDate: today.toJSDate(),
    };
    const lm4 = {
      title: 'title4',
      absoluteFileUri: 'http://myhost.com/document.txt',
      sessionTitle: 'session4title',
      sessionLearningMaterial: 4,
      course: courses[0].id,
      mimetype: 'text/plain',
      courseTitle: courses[0].title,
      courseYear: courses[0].year,
      courseExternalId: courses[0].externalId,
      instructors: ['Instructor3name', 'Instructor4name'],
      firstOfferingDate: tomorrow.toJSDate(),
    };
    const lm5 = {
      title: 'title5',
      isBlanked: true,
      course: courses[4].id,
      sessionTitle: 'session5title',
      sessionLearningMaterial: 5,
      courseTitle: courses[4].title,
      courseYear: courses[4].year,
      courseExternalId: courses[4].externalId,
      firstOfferingDate: tomorrow.toJSDate(),
      endDate: new Date(2013, 2, 1, 1, 10, 0),
    };
    const lm6 = {
      title: 'title6',
      absoluteFileUri: 'http://myhost.com/document.txt',
      course: courses[0].id,
      mimetype: 'text/plain',
      courseTitle: courses[0].title,
      courseYear: courses[0].year,
      courseExternalId: courses[0].externalId,
      instructors: ['Instructor3name', 'Instructor4name'],
      firstOfferingDate: today.toJSDate(),
    };

    const currentMaterials = [lm1, lm2, lm3, lm4, lm5, lm6];
    const notCurrentMaterials = [];
    for (let i = currentMaterials.length + 1, n = i + 200; i < n; i++) {
      notCurrentMaterials.push({
        title: `title ${i}`,
        citation: `citationtext ${i}`,
        sessionTitle: `session title`,
        sessionLearningMaterial: i,
        course: courses[3].id,
        courseTitle: courses[3].title,
        courseYear: courses[3].year,
        courseExternalId: courses[3].externalId,
        firstOfferingDate: nextWeek.toJSDate(),
      });
    }

    this.server.createList('session-learning-material', 6);

    this.server.create('user-session-material-status', {
      user: this.user,
      materialId: 3,
      status: 1,
    });

    this.server.create('user-session-material-status', {
      user: this.user,
      material: this.server.create('session-learning-material', { id: 2 }),
      status: 2,
    });

    this.today = today;
    this.tomorrow = tomorrow;
    this.nextWeek = nextWeek;
    this.currentMaterials = currentMaterials;
    this.allMaterials = [...currentMaterials, ...notCurrentMaterials];
    this.courses = courses;
  });

  hooks.afterEach(() => {
    unfreezeDate();
  });

  test('it renders with materials in show-current mode', async function (assert) {
    this.server.get(`/api/usermaterials/:id`, (scheme, { params, queryParams }) => {
      assert.step('API called');
      assert.ok('id' in params);
      assert.strictEqual(parseInt(params.id, 10), 100);
      assert.ok('before' in queryParams);
      assert.ok('after' in queryParams);
      const before = DateTime.fromSeconds(Number(queryParams.before));
      const after = DateTime.fromSeconds(Number(queryParams.after));
      assert.ok(before.hasSame(this.today.plus({ days: 60 }), 'day'));
      assert.ok(after.hasSame(this.today, 'day'));
      return {
        userMaterials: this.currentMaterials,
      };
    });
    await page.visit();
    await percySnapshot(assert);
    assert.ok(page.navigation.materials.isActive);
    assert.notOk(page.navigation.calendar.isActive);
    assert.notOk(page.navigation.week.isActive);
    assert.ok(page.navigation.isVisible);
    assert.strictEqual(page.materials.title, 'My Materials');
    assert.ok(page.materials.header.displayToggle.firstButton.isChecked);
    assert.strictEqual(page.materials.courseFilter.options.length, 5);
    assert.strictEqual(page.materials.courseFilter.options[0].text, 'All Courses');
    assert.strictEqual(page.materials.courseFilter.options[1].text, '2021 | [ID1234] | course 0');
    assert.strictEqual(page.materials.courseFilter.options[2].text, '2022 | course 1');
    assert.strictEqual(page.materials.courseFilter.options[3].text, '2022 | course 2');
    assert.strictEqual(page.materials.courseFilter.options[4].text, '2022 | course 4');
    assert.ok(page.materials.courseFilter.options[0].isSelected);
    assert.notOk(page.materials.courseFilter.options[1].isSelected);
    assert.notOk(page.materials.courseFilter.options[2].isSelected);
    assert.notOk(page.materials.courseFilter.options[3].isSelected);
    assert.notOk(page.materials.courseFilter.options[4].isSelected);
    assert.strictEqual(page.materials.textFilter.value, '');
    assert.strictEqual(
      page.materials.topPaginator.controls.pagerDetails.text,
      'Showing 1 - 6 of 6',
    );
    assert.strictEqual(
      page.materials.bottomPaginator.controls.pagerDetails.text,
      'Showing 1 - 6 of 6',
    );
    assert.strictEqual(page.materials.table.headers.status.text, 'Status');
    assert.strictEqual(page.materials.table.headers.title.text, 'Title');
    assert.notOk(page.materials.table.headers.title.isSortedOn);
    assert.strictEqual(page.materials.table.headers.sessionTitle.text, 'Session');
    assert.notOk(page.materials.table.headers.sessionTitle.isSortedOn);
    assert.strictEqual(page.materials.table.headers.courseTitle.text, 'Course');
    assert.notOk(page.materials.table.headers.courseTitle.isSortedOn);
    assert.strictEqual(page.materials.table.headers.instructor.text, 'Instructor');
    assert.strictEqual(page.materials.table.headers.firstOfferingDate.text, 'Date');
    assert.ok(page.materials.table.headers.firstOfferingDate.isSortedOn);
    assert.ok(page.materials.table.headers.firstOfferingDate.isSortedDescending);
    assert.notOk(page.materials.table.noResults.isVisible);
    assert.strictEqual(page.materials.table.rows.length, 6);
    assert.ok(page.materials.table.rows[0].status.isPresent);
    assert.notOk(page.materials.table.rows[0].status.isChecked);
    assert.strictEqual(page.materials.table.rows[0].sessionTitle, 'session5title');
    assert.strictEqual(page.materials.table.rows[0].courseTitle, 'course 4');
    assert.strictEqual(
      page.materials.table.rows[0].title,
      'Timed Release title5 (Available until 03/01/2013, 01:10 AM)',
    );
    assert.ok(page.materials.table.rows[0].isTimed);
    assert.strictEqual(page.materials.table.rows[0].instructors, '');
    assert.strictEqual(
      page.materials.table.rows[0].firstOfferingDate,
      this.tomorrow.toFormat('MM/dd/y'),
    );
    assert.ok(page.materials.table.rows[1].status.isPresent);
    assert.notOk(page.materials.table.rows[1].status.isChecked);
    assert.strictEqual(page.materials.table.rows[1].sessionTitle, 'session4title');
    assert.strictEqual(page.materials.table.rows[1].courseTitle, 'course 0');
    assert.strictEqual(page.materials.table.rows[1].title, 'File title4');
    assert.ok(page.materials.table.rows[1].isFile);
    assert.ok(page.materials.table.rows[1].fileLink.isVisible);
    assert.strictEqual(page.materials.table.rows[1].fileLink.url, 'http://myhost.com/document.txt');
    assert.strictEqual(
      page.materials.table.rows[1].instructors,
      'Instructor3name, Instructor4name',
    );
    assert.strictEqual(
      page.materials.table.rows[1].firstOfferingDate,
      this.tomorrow.toFormat('MM/dd/y'),
    );
    assert.ok(page.materials.table.rows[2].status.isPresent);
    assert.ok(page.materials.table.rows[2].status.isChecked);
    assert.strictEqual(page.materials.table.rows[2].sessionTitle, 'session2title');
    assert.strictEqual(page.materials.table.rows[2].courseTitle, 'course 1');
    assert.strictEqual(page.materials.table.rows[2].title, 'Web Link title2');
    assert.ok(page.materials.table.rows[2].isLink);
    assert.ok(page.materials.table.rows[2].link.isVisible);
    assert.strictEqual(page.materials.table.rows[2].link.url, 'http://myhost.com/url2');
    assert.strictEqual(
      page.materials.table.rows[2].instructors,
      'Instructor1name, Instructor2name',
    );
    assert.strictEqual(
      page.materials.table.rows[2].firstOfferingDate,
      this.tomorrow.toFormat('MM/dd/y'),
    );

    assert.notOk(page.materials.table.rows[3].status.isPresent);
    assert.strictEqual(page.materials.table.rows[3].sessionTitle, '');
    assert.strictEqual(page.materials.table.rows[3].courseTitle, 'course 0');
    assert.strictEqual(page.materials.table.rows[3].title, 'File title6');
    assert.ok(page.materials.table.rows[3].isFile);
    assert.strictEqual(
      page.materials.table.rows[3].instructors,
      'Instructor3name, Instructor4name',
    );
    assert.strictEqual(
      page.materials.table.rows[3].firstOfferingDate,
      this.today.toFormat('MM/dd/y'),
    );

    assert.ok(page.materials.table.rows[4].status.isPresent);
    assert.ok(page.materials.table.rows[4].status.isIndeterminate);
    assert.strictEqual(page.materials.table.rows[4].sessionTitle, 'session3title');
    assert.strictEqual(page.materials.table.rows[4].courseTitle, 'course 2');
    assert.strictEqual(page.materials.table.rows[4].title, 'Citation title3 citationtext');
    assert.ok(page.materials.table.rows[4].isCitation);
    assert.strictEqual(page.materials.table.rows[4].instructors, '');
    assert.strictEqual(
      page.materials.table.rows[4].firstOfferingDate,
      this.today.toFormat('MM/dd/y'),
    );
    assert.ok(page.materials.table.rows[5].status.isPresent);
    assert.notOk(page.materials.table.rows[5].status.isChecked);
    assert.strictEqual(page.materials.table.rows[5].sessionTitle, 'session1title');
    assert.strictEqual(page.materials.table.rows[5].courseTitle, 'course 0');
    assert.strictEqual(page.materials.table.rows[5].title, 'PDF file title1 Download');
    assert.ok(page.materials.table.rows[5].isPdf);
    assert.ok(page.materials.table.rows[5].pdfDownloadLink.isVisible);
    assert.strictEqual(page.materials.table.rows[5].pdfDownloadLink.url, 'http://myhost.com/url1');
    assert.ok(page.materials.table.rows[5].pdfLink.isVisible);
    assert.strictEqual(page.materials.table.rows[5].pdfLink.url, 'http://myhost.com/url1?inline');
    assert.strictEqual(
      page.materials.table.rows[5].instructors,
      'Instructor1name, Instructor2name',
    );
    assert.strictEqual(
      page.materials.table.rows[5].firstOfferingDate,
      this.today.toFormat('MM/dd/y'),
    );
    await a11yAudit();
    assert.ok(true, 'no a11y errors found!');
    assert.verifySteps(['API called']);
  });

  test('it renders with materials in show-all mode', async function (assert) {
    this.server.get(`/api/usermaterials/:id`, (scheme, { params, queryParams }) => {
      assert.step('API called');
      assert.ok('id' in params);
      assert.strictEqual(parseInt(params.id, 10), 100);
      assert.notOk('before' in queryParams);
      assert.notOk('after' in queryParams);
      return {
        userMaterials: this.allMaterials,
      };
    });

    await page.visit({ showAll: true });
    await percySnapshot(assert);
    assert.ok(page.navigation.isVisible);
    assert.ok(page.materials.header.displayToggle.secondButton.isChecked);
    assert.strictEqual(page.materials.courseFilter.options.length, 6);
    assert.strictEqual(page.materials.courseFilter.options[0].text, 'All Courses');
    assert.strictEqual(page.materials.courseFilter.options[1].text, '2021 | [ID1234] | course 0');
    assert.strictEqual(page.materials.courseFilter.options[2].text, '2022 | course 1');
    assert.strictEqual(page.materials.courseFilter.options[3].text, '2022 | course 2');
    assert.strictEqual(page.materials.courseFilter.options[4].text, '2022 | course 3');
    assert.strictEqual(page.materials.courseFilter.options[5].text, '2022 | course 4');
    assert.strictEqual(
      page.materials.topPaginator.controls.pagerDetails.text,
      'Showing 1 - 25 of 206',
    );
    assert.strictEqual(
      page.materials.bottomPaginator.controls.pagerDetails.text,
      'Showing 1 - 25 of 206',
    );
    assert.strictEqual(page.materials.table.rows.length, 25);
    assert.verifySteps(['API called']);
  });

  test('pagination works', async function (assert) {
    this.server.get(`/api/usermaterials/:id`, () => {
      assert.step('API called');
      return {
        userMaterials: this.allMaterials,
      };
    });

    await page.visit({ showAll: true, offset: 100, limit: 50 });
    assert.strictEqual(
      page.materials.topPaginator.controls.pagerDetails.text,
      'Showing 101 - 150 of 206',
    );
    assert.strictEqual(page.materials.table.rows.length, 50);
    assert.strictEqual(page.materials.table.rows[0].title, 'Citation title 106 citationtext 106');
    await page.materials.topPaginator.controls.nextPage.click();
    assert.strictEqual(
      page.materials.topPaginator.controls.pagerDetails.text,
      'Showing 151 - 200 of 206',
    );
    assert.strictEqual(page.materials.table.rows[0].title, 'Citation title 56 citationtext 56');
    assert.verifySteps(['API called']);
  });

  test('sorting works', async function (assert) {
    this.server.get(`/api/usermaterials/:id`, () => {
      assert.step('API called');
      return {
        userMaterials: this.allMaterials,
      };
    });
    await page.visit({ showAll: true, sortBy: 'title:desc' });
    assert.ok(page.materials.table.headers.title.isSortedDescending);
    assert.strictEqual(
      page.materials.table.rows[1].title,
      'Timed Release title5 (Available until 03/01/2013, 01:10 AM)',
    );
    await page.materials.table.headers.title.click();
    assert.ok(page.materials.table.headers.title.isSortedAscending);
    assert.strictEqual(page.materials.table.rows[0].title, 'Citation title 10 citationtext 10');
    assert.notOk(page.materials.table.headers.courseTitle.isSortedOn);
    await page.materials.table.headers.courseTitle.click();
    assert.ok(page.materials.table.headers.courseTitle.isSortedAscending);
    assert.strictEqual(page.materials.table.rows[0].courseTitle, 'course 0');
    await page.materials.table.headers.courseTitle.click();
    assert.ok(page.materials.table.headers.courseTitle.isSortedDescending);
    assert.strictEqual(page.materials.table.rows[0].courseTitle, 'course 4');
    assert.notOk(page.materials.table.headers.sessionTitle.isSortedOn);
    await page.materials.table.headers.sessionTitle.click();
    assert.ok(page.materials.table.headers.sessionTitle.isSortedAscending);
    assert.strictEqual(page.materials.table.rows[0].sessionTitle, '');
    await page.materials.table.headers.sessionTitle.click();
    assert.ok(page.materials.table.headers.sessionTitle.isSortedDescending);
    assert.strictEqual(page.materials.table.rows[0].sessionTitle, 'session5title');
    assert.notOk(page.materials.table.headers.firstOfferingDate.isSortedOn);
    await page.materials.table.headers.firstOfferingDate.click();
    assert.ok(page.materials.table.headers.firstOfferingDate.isSortedAscending);
    assert.strictEqual(
      page.materials.table.rows[0].firstOfferingDate,
      this.today.toFormat('MM/dd/y'),
    );
    await page.materials.table.headers.firstOfferingDate.click();
    assert.ok(page.materials.table.headers.firstOfferingDate.isSortedDescending);
    assert.strictEqual(
      page.materials.table.rows[0].firstOfferingDate,
      this.nextWeek.toFormat('M/d/y'),
    );
    assert.verifySteps(['API called']);
  });

  test('toggling view mode works and resets pagination', async function (assert) {
    this.server.get(`/api/usermaterials/:id`, () => {
      assert.step('API called');
      return {
        userMaterials: this.allMaterials,
      };
    });
    await page.visit();
    assert.ok(page.materials.header.displayToggle.firstButton.isChecked);
    assert.strictEqual(
      page.materials.topPaginator.controls.pagerDetails.text,
      'Showing 1 - 25 of 206',
    );
    await page.materials.topPaginator.controls.limit.set(50);
    await page.materials.topPaginator.controls.nextPage.click();
    assert.strictEqual(
      page.materials.topPaginator.controls.pagerDetails.text,
      'Showing 51 - 100 of 206',
    );
    await page.materials.header.displayToggle.secondButton.click();
    assert.strictEqual(
      page.materials.topPaginator.controls.pagerDetails.text,
      'Showing 1 - 25 of 206',
    );
    assert.ok(page.materials.header.displayToggle.secondButton.isChecked);
    assert.verifySteps(['API called', 'API called']);
  });

  test('text filtering works and resets pagination', async function (assert) {
    this.server.get(`/api/usermaterials/:id`, () => {
      assert.step('API called');
      return {
        userMaterials: this.allMaterials,
      };
    });
    await page.visit({ filter: 'session1title' });
    assert.strictEqual(
      page.materials.topPaginator.controls.pagerDetails.text,
      'Showing 1 - 1 of 1',
    );
    assert.strictEqual(page.materials.textFilter.value, 'session1title');
    await page.materials.textFilter.set('');
    assert.strictEqual(
      page.materials.topPaginator.controls.pagerDetails.text,
      'Showing 1 - 25 of 206',
    );
    await page.materials.topPaginator.controls.limit.set(50);
    await page.materials.topPaginator.controls.nextPage.click();
    assert.strictEqual(
      page.materials.topPaginator.controls.pagerDetails.text,
      'Showing 51 - 100 of 206',
    );
    await page.materials.textFilter.set('session title');
    assert.strictEqual(
      page.materials.topPaginator.controls.pagerDetails.text,
      'Showing 1 - 50 of 200',
    );
    assert.verifySteps(['API called']);
  });

  test('course filtering works and resets pagination', async function (assert) {
    this.server.get(`/api/usermaterials/:id`, () => {
      assert.step('API called');
      return {
        userMaterials: this.allMaterials,
      };
    });
    await page.visit({ course: 1 });
    assert.strictEqual(
      page.materials.topPaginator.controls.pagerDetails.text,
      'Showing 1 - 3 of 3',
    );
    assert.ok(page.materials.courseFilter.options[1].isSelected);
    await page.materials.courseFilter.set('');
    assert.ok(page.materials.courseFilter.options[0].isSelected);
    assert.strictEqual(
      page.materials.topPaginator.controls.pagerDetails.text,
      'Showing 1 - 25 of 206',
    );
    await page.materials.topPaginator.controls.limit.set(50);
    await page.materials.topPaginator.controls.nextPage.click();
    assert.strictEqual(
      page.materials.topPaginator.controls.pagerDetails.text,
      'Showing 51 - 100 of 206',
    );
    await page.materials.textFilter.set('session title');
    assert.strictEqual(
      page.materials.topPaginator.controls.pagerDetails.text,
      'Showing 1 - 50 of 200',
    );
    assert.verifySteps(['API called']);
  });

  test('pre-selected course exists but course-filter does not apply', async function (assert) {
    this.server.get(`/api/usermaterials/:id`, () => {
      assert.step('API called');
      return {
        userMaterials: this.currentMaterials,
      };
    });
    await page.visit({ course: 4 });
    assert.strictEqual(
      page.materials.topPaginator.controls.pagerDetails.text,
      'Showing 1 - 0 of 0',
    );
    assert.strictEqual(page.materials.courseFilter.options.length, 6);
    assert.strictEqual(page.materials.courseFilter.options[0].text, 'All Courses');
    assert.strictEqual(page.materials.courseFilter.options[1].text, '2021 | [ID1234] | course 0');
    assert.strictEqual(page.materials.courseFilter.options[2].text, '2022 | course 1');
    assert.strictEqual(page.materials.courseFilter.options[3].text, '2022 | course 2');
    assert.strictEqual(page.materials.courseFilter.options[4].text, '2022 | course 4');
    assert.strictEqual(page.materials.courseFilter.options[5].text, '2022 | course 3');
    assert.ok(page.materials.courseFilter.options[5].isSelected);
    assert.ok(page.materials.courseFilter.options[5].isDisabled);
    assert.verifySteps(['API called']);
  });

  test('pre-selected course does not exist', async function (assert) {
    this.server.get(`/api/usermaterials/:id`, () => {
      assert.step('API called');
      return {
        userMaterials: this.currentMaterials,
      };
    });
    await page.visit({ course: 10000 });
    assert.strictEqual(
      page.materials.topPaginator.controls.pagerDetails.text,
      'Showing 1 - 0 of 0',
    );
    assert.strictEqual(page.materials.courseFilter.options.length, 6);
    assert.strictEqual(page.materials.courseFilter.options[0].text, 'All Courses');
    assert.strictEqual(page.materials.courseFilter.options[1].text, '2021 | [ID1234] | course 0');
    assert.strictEqual(page.materials.courseFilter.options[2].text, '2022 | course 1');
    assert.strictEqual(page.materials.courseFilter.options[3].text, '2022 | course 2');
    assert.strictEqual(page.materials.courseFilter.options[4].text, '2022 | course 4');
    assert.strictEqual(page.materials.courseFilter.options[5].text, '** course not found **');
    assert.ok(page.materials.courseFilter.options[5].isSelected);
    assert.ok(page.materials.courseFilter.options[5].isDisabled);
    assert.verifySteps(['API called']);
  });

  test('mark material status', async function (assert) {
    this.server.get(`/api/usermaterials/:id`, () => {
      assert.step('API called');
      return {
        userMaterials: this.currentMaterials,
      };
    });
    await page.visit();
    await percySnapshot(getUniqueName(assert, 'default'));

    const materials = page.materials.table.rows;
    assert.strictEqual(materials.length, 6);

    assert.notOk(materials[0].status.isChecked);
    assert.notOk(materials[1].status.isChecked);
    assert.ok(materials[2].status.isChecked);
    assert.ok(materials[4].status.isIndeterminate);
    assert.notOk(materials[5].status.isChecked);

    await materials[0].status.click();
    await materials[0].status.click();
    await materials[2].status.click();
    await materials[4].status.click();
    await materials[4].status.click();
    await materials[5].status.click();
    await percySnapshot(getUniqueName(assert, 'checkbox status'));

    assert.ok(materials[0].status.isChecked);
    assert.notOk(materials[1].status.isChecked);
    assert.notOk(materials[2].status.isChecked);
    assert.notOk(materials[2].status.isIndeterminate);
    assert.notOk(materials[4].status.isChecked);
    assert.notOk(materials[4].status.isIndeterminate);
    assert.ok(materials[5].status.isIndeterminate);
    assert.verifySteps(['API called']);
  });
});
