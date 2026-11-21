import { currentURL } from '@ember/test-helpers';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { setupApplicationTest,setupAuthentication } from 'frontend/tests/helpers';
import page from 'frontend/tests/pages/course-materials';
import {DateTime} from "luxon";
import { module, test } from 'qunit';
module('Acceptance | Course - Materials', function (hooks) {
  setupApplicationTest(hooks);
  hooks.beforeEach(async function () {
    const school = await this.server.create('school');
    const courses = await this.server.createList('course', 2, {
      school,
      year: 2027,
      externalId: 'ILIOS11',
      level: 3,
      startDate: '2027-04-03',
      endDate: '2027-12-11',
      published: true,
    });
    this.course = courses[0];
    this.emptyCourse = courses[1];

    const lm1 = await this.server.create('learning-material', {
      title: 'title1',
      description: 'description1',
      originalAuthor: 'author1',
      link: 'http://myhost.com/url1',
    });
    const lm2 = await this.server.create('learning-material', {
      title: 'title2',
      description: 'description2',
      originalAuthor: 'author2',
      filename: 'testfile.txt',
      absoluteFileUri: 'http://myhost.com/url2',
    });
    const lm3 = await this.server.create('learning-material', {
      title: 'title3',
      description: 'description3',
      originalAuthor: 'author3',
      citation: 'citationtext',
    });

    await this.server.create('course-learning-material', { course: this.course, learningMaterial: lm1 });
    await this.server.create('course-learning-material', { course: this.course, learningMaterial: lm2 });
    await this.server.create('course-learning-material', { course: this.course, learningMaterial: lm3 });

    const sessions = await this.server.createList('session', 3, { course: this.course });
    await this.server.create('session-learning-material', { session: sessions[0], learningMaterial: lm1 });
    await this.server.create('session-learning-material', { session: sessions[1], learningMaterial: lm2 });
    await this.server.create('session-learning-material', { session: sessions[2], learningMaterial: lm3 });

    await this.server.create('offering', {
      session: sessions[2],
      startDate: DateTime.fromObject({ year: 2027, month: 5, day: 1 }).toISO(),
      endDate: DateTime.fromObject({ year: 2027, month: 5, day: 1 }).toISO(),
    });
    await this.server.create('offering', {
      session: sessions[1],
      startDate: DateTime.fromObject({ year: 2027, month: 7, day: 10 }).toISO(),
      endDate: DateTime.fromObject({ year: 2027, month: 7, day: 11 }).toISO(),
    });

    await setupAuthentication({ directedSchools: [school] });
  });

  test('it renders', async function (assert) {
    await page.visit({ courseId: this.course.id });

    assert.strictEqual(page.backToCourse.text, 'Back to Course');
    assert.strictEqual(page.backToCourse.url, `/courses/${this.course.id}`);
    assert.strictEqual(page.summaryHeader.title, 'course 0');
    assert.strictEqual(page.summaryHeader.start, '04/03/2027');
    assert.strictEqual(page.summaryHeader.end, '12/11/2027');
    assert.strictEqual(page.summaryHeader.externalId, 'ILIOS11');
    assert.strictEqual(page.summaryHeader.level, '3');
    assert.strictEqual(page.summaryHeader.status, 'Published');
    assert.ok(page.summaryHeader.actions.canPrint);
    assert.ok(page.summaryHeader.actions.canRollover);

    assert.strictEqual(page.materials.courseMaterialsCount, '3');

    assert.strictEqual(page.materials.courses[0].title, 'title1');
    assert.ok(page.materials.courses[0].hasLink);
    assert.strictEqual(page.materials.courses[0].link, 'http://myhost.com/url1');
    assert.strictEqual(page.materials.courses[0].type, 'Link');
    assert.strictEqual(page.materials.courses[0].author, 'author1');
    assert.strictEqual(page.materials.courses[1].title, 'title2');
    assert.ok(page.materials.courses[1].hasLink);
    assert.strictEqual(page.materials.courses[1].link, 'http://myhost.com/url2');
    assert.strictEqual(page.materials.courses[1].type, 'File');
    assert.strictEqual(page.materials.courses[1].author, 'author2');
    assert.strictEqual(page.materials.courses[2].title, 'title3 citationtext');
    assert.notOk(page.materials.courses[2].hasLink);
    assert.strictEqual(page.materials.courses[2].type, 'Citation');
    assert.strictEqual(page.materials.courses[2].author, 'author3');

    assert.strictEqual(page.materials.sessionMaterialsCount, '3');

    assert.strictEqual(page.materials.sessions[0].title, 'title3 citationtext');
    assert.notOk(page.materials.sessions[0].hasLink);
    assert.strictEqual(page.materials.sessions[0].type, 'Citation');
    assert.strictEqual(page.materials.sessions[0].author, 'author3');
    assert.strictEqual(page.materials.sessions[0].sessionTitle, 'session 2');
    assert.strictEqual(page.materials.sessions[0].firstOffering, '05/01/2027');
    assert.strictEqual(page.materials.sessions[1].title, 'title2');
    assert.ok(page.materials.sessions[1].hasLink);
    assert.strictEqual(page.materials.sessions[1].link, 'http://myhost.com/url2');
    assert.strictEqual(page.materials.sessions[1].type, 'File');
    assert.strictEqual(page.materials.sessions[1].author, 'author2');
    assert.strictEqual(page.materials.sessions[1].sessionTitle, 'session 1');
    assert.strictEqual(page.materials.sessions[1].firstOffering, '07/10/2027');
    assert.strictEqual(page.materials.sessions[2].title, 'title1');
    assert.ok(page.materials.sessions[2].hasLink);
    assert.strictEqual(page.materials.sessions[2].link, 'http://myhost.com/url1');
    assert.strictEqual(page.materials.sessions[2].type, 'Link');
    assert.strictEqual(page.materials.sessions[2].author, 'author1');
    assert.strictEqual(page.materials.sessions[2].sessionTitle, 'session 0');
    assert.strictEqual(page.materials.sessions[2].firstOffering, 'None');

    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('it renders empty', async function (assert) {
    await page.visit({ courseId: this.emptyCourse.id });
    assert.strictEqual(page.materials.courseMaterialsCount, '0');
    assert.strictEqual(page.materials.sessionMaterialsCount, '0');

    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('sorting course materials', async function (assert) {
    await page.visit({ courseId: this.course.id });

    assert.notOk(currentURL().includes('courseSort'));
    assert.strictEqual(page.materials.courseMaterialsCount, '3');
    assert.strictEqual(page.materials.courses[0].title, 'title1');
    assert.ok(page.materials.courses[0].hasLink);
    assert.strictEqual(page.materials.courses[0].link, 'http://myhost.com/url1');
    assert.strictEqual(page.materials.courses[0].type, 'Link');
    assert.strictEqual(page.materials.courses[0].author, 'author1');
    assert.strictEqual(page.materials.courses[1].title, 'title2');
    assert.ok(page.materials.courses[1].hasLink);
    assert.strictEqual(page.materials.courses[1].link, 'http://myhost.com/url2');
    assert.strictEqual(page.materials.courses[1].type, 'File');
    assert.strictEqual(page.materials.courses[1].author, 'author2');
    assert.strictEqual(page.materials.courses[2].title, 'title3 citationtext');
    assert.notOk(page.materials.courses[2].hasLink);
    assert.strictEqual(page.materials.courses[2].type, 'Citation');
    assert.strictEqual(page.materials.courses[2].author, 'author3');

    await page.materials.sortCoursesBy.title();

    assert.ok(currentURL().includes(`courseSort=${encodeURIComponent('title:desc')}`));
    assert.strictEqual(page.materials.courses[0].title, 'title3 citationtext');
    assert.strictEqual(page.materials.courses[1].title, 'title2');
    assert.strictEqual(page.materials.courses[2].title, 'title1');

    await page.materials.sortCoursesBy.title();

    assert.notOk(currentURL().includes('courseSort'));
    assert.strictEqual(page.materials.courses[0].title, 'title1');
    assert.strictEqual(page.materials.courses[1].title, 'title2');
    assert.strictEqual(page.materials.courses[2].title, 'title3 citationtext');

    await page.materials.sortCoursesBy.type();

    assert.ok(currentURL().includes('courseSort=type'));
    assert.strictEqual(page.materials.courses[0].type, 'Citation');
    assert.strictEqual(page.materials.courses[1].type, 'File');
    assert.strictEqual(page.materials.courses[2].type, 'Link');

    await page.materials.sortCoursesBy.type();

    assert.ok(currentURL().includes(`courseSort=${encodeURIComponent('type:desc')}`));
    assert.strictEqual(page.materials.courses[0].type, 'Link');
    assert.strictEqual(page.materials.courses[1].type, 'File');
    assert.strictEqual(page.materials.courses[2].type, 'Citation');

    await page.materials.sortCoursesBy.author();

    assert.ok(currentURL().includes('courseSort=originalAuthor'));
    assert.strictEqual(page.materials.courses[0].author, 'author1');
    assert.strictEqual(page.materials.courses[1].author, 'author2');
    assert.strictEqual(page.materials.courses[2].author, 'author3');

    await page.materials.sortCoursesBy.author();

    assert.ok(currentURL().includes(`courseSort=${encodeURIComponent('originalAuthor:desc')}`));
    assert.strictEqual(page.materials.courses[0].author, 'author3');
    assert.strictEqual(page.materials.courses[1].author, 'author2');
    assert.strictEqual(page.materials.courses[2].author, 'author1');
  });

  test('sorting session materials', async function (assert) {
    await page.visit({ courseId: this.course.id });

    assert.notOk(currentURL().includes('sessionSort'));

    assert.strictEqual(page.materials.sessions[0].title, 'title3 citationtext');
    assert.notOk(page.materials.sessions[0].hasLink);
    assert.strictEqual(page.materials.sessions[0].type, 'Citation');
    assert.strictEqual(page.materials.sessions[0].author, 'author3');
    assert.strictEqual(page.materials.sessions[0].sessionTitle, 'session 2');
    assert.strictEqual(page.materials.sessions[0].firstOffering, '05/01/2027');
    assert.strictEqual(page.materials.sessions[1].title, 'title2');
    assert.ok(page.materials.sessions[1].hasLink);
    assert.strictEqual(page.materials.sessions[1].link, 'http://myhost.com/url2');
    assert.strictEqual(page.materials.sessions[1].type, 'File');
    assert.strictEqual(page.materials.sessions[1].author, 'author2');
    assert.strictEqual(page.materials.sessions[1].sessionTitle, 'session 1');
    assert.strictEqual(page.materials.sessions[1].firstOffering, '07/10/2027');
    assert.strictEqual(page.materials.sessions[2].title, 'title1');
    assert.ok(page.materials.sessions[2].hasLink);
    assert.strictEqual(page.materials.sessions[2].link, 'http://myhost.com/url1');
    assert.strictEqual(page.materials.sessions[2].type, 'Link');
    assert.strictEqual(page.materials.sessions[2].author, 'author1');
    assert.strictEqual(page.materials.sessions[2].sessionTitle, 'session 0');
    assert.strictEqual(page.materials.sessions[2].firstOffering, 'None');

    await page.materials.sortSessionsBy.firstOffering();

    assert.ok(currentURL().includes(`sessionSort=${encodeURIComponent('session.firstOfferingDate:desc')}`));
    assert.strictEqual(page.materials.sessions[0].firstOffering, '07/10/2027');
    assert.strictEqual(page.materials.sessions[1].firstOffering, '05/01/2027');
    assert.strictEqual(page.materials.sessions[2].firstOffering, 'None');

    await page.materials.sortSessionsBy.firstOffering();

    assert.notOk(currentURL().includes('sessionSort'));
    assert.strictEqual(page.materials.sessions[0].firstOffering, '05/01/2027');
    assert.strictEqual(page.materials.sessions[1].firstOffering, '07/10/2027');
    assert.strictEqual(page.materials.sessions[2].firstOffering, 'None');

    await page.materials.sortSessionsBy.title();

    assert.ok(currentURL().includes('sessionSort=lm.title'));
    assert.strictEqual(page.materials.sessions[0].title, 'title1');
    assert.strictEqual(page.materials.sessions[1].title, 'title2');
    assert.strictEqual(page.materials.sessions[2].title, 'title3 citationtext');

    await page.materials.sortSessionsBy.title();

    assert.ok(currentURL().includes(`sessionSort=${encodeURIComponent('lm.title:desc')}`));
    assert.strictEqual(page.materials.sessions[0].title, 'title3 citationtext');
    assert.strictEqual(page.materials.sessions[1].title, 'title2');
    assert.strictEqual(page.materials.sessions[2].title, 'title1');

    await page.materials.sortSessionsBy.type();

    assert.ok(currentURL().includes('sessionSort=lm.type'));
    assert.strictEqual(page.materials.sessions[0].type, 'Citation');
    assert.strictEqual(page.materials.sessions[1].type, 'File');
    assert.strictEqual(page.materials.sessions[2].type, 'Link');

    await page.materials.sortSessionsBy.type();

    assert.ok(currentURL().includes(`sessionSort=${encodeURIComponent('lm.type:desc')}`));
    assert.strictEqual(page.materials.sessions[0].type, 'Link');
    assert.strictEqual(page.materials.sessions[1].type, 'File');
    assert.strictEqual(page.materials.sessions[2].type, 'Citation');

    await page.materials.sortSessionsBy.author();

    assert.ok(currentURL().includes('sessionSort=lm.originalAuthor'));
    assert.strictEqual(page.materials.sessions[0].author, 'author1');
    assert.strictEqual(page.materials.sessions[1].author, 'author2');
    assert.strictEqual(page.materials.sessions[2].author, 'author3');

    await page.materials.sortSessionsBy.author();

    assert.ok(currentURL().includes(`sessionSort=${encodeURIComponent('lm.originalAuthor:desc')}`));
    assert.strictEqual(page.materials.sessions[0].author, 'author3');
    assert.strictEqual(page.materials.sessions[1].author, 'author2');
    assert.strictEqual(page.materials.sessions[2].author, 'author1');

    await page.materials.sortSessionsBy.sessionTitle();

    assert.ok(currentURL().includes('sessionSort=session.title'));
    assert.strictEqual(page.materials.sessions[0].sessionTitle, 'session 0');
    assert.strictEqual(page.materials.sessions[1].sessionTitle, 'session 1');
    assert.strictEqual(page.materials.sessions[2].sessionTitle, 'session 2');

    await page.materials.sortSessionsBy.sessionTitle();

    assert.ok(currentURL().includes(`sessionSort=${encodeURIComponent('session.title:desc')}`));
    assert.strictEqual(page.materials.sessions[0].sessionTitle, 'session 2');
    assert.strictEqual(page.materials.sessions[1].sessionTitle, 'session 1');
    assert.strictEqual(page.materials.sessions[2].sessionTitle, 'session 0');
  });
});
