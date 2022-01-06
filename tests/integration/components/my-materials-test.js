import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { click, fillIn, find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';

module('Integration | Component | my-materials', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');

  hooks.beforeEach(function () {
    const lm1 = EmberObject.create({
      title: 'title1',
      absoluteFileUri: 'http://myhost.com/url1',
      filename: 'url1',
      sessionTitle: 'session1title',
      course: '1',
      courseTitle: 'course1title',
      instructors: ['Instructor1name', 'Instructor2name'],
      firstOfferingDate: new Date(2003, 1, 2, 12),
      mimetype: 'application/pdf',
    });
    const lm2 = EmberObject.create({
      title: 'title2',
      link: 'http://myhost.com/url2',
      sessionTitle: 'session2title',
      course: '2',
      courseTitle: 'course2title',
      instructors: ['Instructor1name', 'Instructor2name'],
      firstOfferingDate: new Date(2016, 1, 2, 12),
    });
    const lm3 = EmberObject.create({
      title: 'title3',
      citation: 'citationtext',
      sessionTitle: 'session3title',
      course: '3',
      courseTitle: 'course3title',
      firstOfferingDate: new Date(2020, 1, 2, 12),
    });
    const lm4 = EmberObject.create({
      title: 'title4',
      absoluteFileUri: 'http://myhost.com/document.txt',
      filename: 'document.txt',
      sessionTitle: 'session4title',
      course: '4',
      courseTitle: 'course4title',
      instructors: ['Instructor3name', 'Instructor4name'],
      firstOfferingDate: new Date(2030, 1, 2, 12),
      mimetype: 'plain/text',
    });
    const lm5 = EmberObject.create({
      title: 'title5',
      sessionTitle: 'session5title',
      absoluteFileUri: 'http://myhost.com/someothertextdocument.txt',
      filename: 'someothertextdocument.txt',
      course: '5',
      courseTitle: 'course5title',
      firstOfferingDate: new Date(2040, 1, 2, 12),
      isBlanked: true,
      endDate: new Date('2013-03-01T01:10:00'),
    });

    this.materials = [lm1, lm2, lm3, lm4, lm5];
  });

  test('it renders empty', async function (assert) {
    assert.expect(1);

    this.setProperties({ materials: [], nothing: parseInt });
    await render(hbs`<MyMaterials
      @materials={{this.materials}}
      @sortBy="firstOfferingDate"
      @setCourseIdFilter={{(noop)}}
      @setFilter={{(noop)}}
    />`);
    assert.dom('[data-test-none]').exists();
  });

  test('it renders with materials', async function (assert) {
    assert.expect(42);

    this.set('materials', this.materials);
    await render(hbs`<MyMaterials
      @materials={{this.materials}}
      @sortBy="firstOfferingDate"
      @setCourseIdFilter={{(noop)}}
      @setFilter={{(noop)}}
    />`);

    const table = 'table:nth-of-type(1)';
    const materials = `${table} tbody tr`;

    const firstLmTitle = `${materials}:nth-of-type(1) [data-test-title]`;
    const firstLmLink = `${firstLmTitle} a:nth-of-type(1)`;
    const firstLmTypeIcon = `${firstLmTitle} .fa-file-pdf`;
    const firstLmCourseTitle = `${materials}:nth-of-type(1) [data-test-course-title]`;
    const firstLmSessionTitle = `${materials}:nth-of-type(1) [data-test-session-title]`;
    const firstLmInstructor = `${materials}:nth-of-type(1) [data-test-instructor]`;
    const firstLmFirstOffering = `${materials}:nth-of-type(1) [data-test-date]`;
    const firstLmDownloadLink = `${firstLmTitle} a:nth-of-type(2)`;

    const secondLmTitle = `${materials}:nth-of-type(2) [data-test-title]`;
    const secondLmLink = `${secondLmTitle} a`;
    const secondLmTypeIcon = `${secondLmTitle} .fa-link`;

    const secondLmCourseTitle = `${materials}:nth-of-type(2) [data-test-course-title]`;
    const secondLmSessionTitle = `${materials}:nth-of-type(2) [data-test-session-title]`;
    const secondLmInstructor = `${materials}:nth-of-type(2) [data-test-instructor]`;
    const secondLmFirstOffering = `${materials}:nth-of-type(2) [data-test-date]`;

    const thirdLmTitle = `${materials}:nth-of-type(3) [data-test-title]`;
    const thirdLmLink = `${thirdLmTitle} a`;
    const thirdLmTypeIcon = `${thirdLmTitle} .fa-paragraph`;
    const thirdLmCourseTitle = `${materials}:nth-of-type(3) [data-test-course-title]`;
    const thirdLmSessionTitle = `${materials}:nth-of-type(3) [data-test-session-title]`;
    const thirdLmInstructor = `${materials}:nth-of-type(3) [data-test-instructor]`;
    const thirdLmFirstOffering = `${materials}:nth-of-type(3) [data-test-date]`;

    const fourthLmTitle = `${materials}:nth-of-type(4) [data-test-title]`;
    const fourthLmLink = `${fourthLmTitle} a`;
    const fourthLmTypeIcon = `${fourthLmTitle} .fa-file`;
    const fourthLmCourseTitle = `${materials}:nth-of-type(4) [data-test-course-title]`;
    const fourthLmSessionTitle = `${materials}:nth-of-type(4) [data-test-session-title]`;
    const fourthLmInstructor = `${materials}:nth-of-type(4) [data-test-instructor]`;
    const fourthLmFirstOffering = `${materials}:nth-of-type(4) [data-test-date]`;

    const fifthLmTitle = `${materials}:nth-of-type(5) [data-test-title]`;
    const fifthLmTypeIcon = `${fifthLmTitle} .fa-clock`;
    const fifthLmCourseTitle = `${materials}:nth-of-type(5) [data-test-course-title]`;
    const fifthLmSessionTitle = `${materials}:nth-of-type(5) [data-test-session-title]`;
    const fifthLmInstructor = `${materials}:nth-of-type(5) [data-test-instructor]`;
    const fifthLmFirstOffering = `${materials}:nth-of-type(5) [data-test-date]`;

    const courseListOptions = '.course-filter option';
    const allCourses = `${courseListOptions}:nth-of-type(1)`;
    const firstCourse = `${courseListOptions}:nth-of-type(2)`;
    const secondCourse = `${courseListOptions}:nth-of-type(3)`;
    const thirdCourse = `${courseListOptions}:nth-of-type(4)`;
    const fourthCourse = `${courseListOptions}:nth-of-type(5)`;
    const fifthCourse = `${courseListOptions}:nth-of-type(6)`;

    assert.dom(firstLmLink).hasText('title1');
    assert.strictEqual(find(firstLmLink).href.trim(), 'http://myhost.com/url1?inline');
    assert.dom(firstLmTypeIcon).exists({ count: 1 }, 'LM type icon is present.');
    assert.dom(firstLmSessionTitle).hasText('session1title');
    assert.dom(firstLmCourseTitle).hasText('course1title');
    assert.dom(firstLmInstructor).hasText('Instructor1name, Instructor2name');
    assert.dom(firstLmFirstOffering).hasText('2/2/2003');
    assert.strictEqual(find(firstLmDownloadLink).href.trim(), 'http://myhost.com/url1');

    assert.dom(secondLmLink).hasText('title2');
    assert.strictEqual(find(secondLmLink).href.trim(), 'http://myhost.com/url2');
    assert.dom(secondLmTypeIcon).exists({ count: 1 }, 'LM type icon is present.');
    assert.dom(secondLmSessionTitle).hasText('session2title');
    assert.dom(secondLmCourseTitle).hasText('course2title');
    assert.dom(secondLmInstructor).hasText('Instructor1name, Instructor2name');
    assert.dom(secondLmFirstOffering).hasText('2/2/2016');

    assert.strictEqual(
      find(thirdLmTitle).textContent.replace(/[\t\n\s]+/g, ''),
      'Citationtitle3citationtext'
    );
    assert.dom(thirdLmLink).doesNotExist();
    assert.dom(thirdLmTypeIcon).exists({ count: 1 }, 'LM type icon is present.');
    assert.dom(thirdLmSessionTitle).hasText('session3title');
    assert.dom(thirdLmCourseTitle).hasText('course3title');
    assert.dom(thirdLmInstructor).hasText('');
    assert.dom(thirdLmFirstOffering).hasText('2/2/2020');

    assert.dom(fourthLmLink).hasText('title4');
    assert.strictEqual(find(fourthLmLink).href.trim(), 'http://myhost.com/document.txt');
    assert.dom(fourthLmTypeIcon).exists({ count: 1 }, 'LM type icon is present.');
    assert.dom(fourthLmSessionTitle).hasText('session4title');
    assert.dom(fourthLmCourseTitle).hasText('course4title');
    assert.dom(fourthLmInstructor).hasText('Instructor3name, Instructor4name');
    assert.dom(fourthLmFirstOffering).hasText('2/2/2030');

    assert.ok(find(fifthLmTitle).textContent.includes('title5'));
    assert.dom(fifthLmTypeIcon).exists({ count: 1 }, 'LM type icon is present.');
    assert.dom(fifthLmSessionTitle).hasText('session5title');
    assert.dom(fifthLmCourseTitle).hasText('course5title');
    assert.dom(fifthLmInstructor).hasText('');
    assert.dom(fifthLmFirstOffering).hasText('2/2/2040');

    assert.dom(courseListOptions).exists({ count: 6 });
    assert.dom(allCourses).hasText('All Courses');
    assert.dom(firstCourse).hasText('course1title');
    assert.dom(secondCourse).hasText('course2title');
    assert.dom(thirdCourse).hasText('course3title');
    assert.dom(fourthCourse).hasText('course4title');
    assert.dom(fifthCourse).hasText('course5title');
  });

  test('filter by title', async function (assert) {
    assert.expect(4);

    this.set('materials', this.materials);
    this.set('filter', null);
    await render(hbs`<MyMaterials
      @filter={{this.filter}}
      @materials={{this.materials}}
      @sortBy="firstOfferingDate"
      @setCourseIdFilter={{(noop)}}
      @setFilter={{set this.filter}}
    />`);

    const table = 'table:nth-of-type(1)';
    const materials = `${table} tbody tr`;
    const firstLmTitle = `${materials}:nth-of-type(1) [data-test-title] a`;

    assert.dom(materials).exists({ count: 5 });
    assert.dom(firstLmTitle).hasText('title1');
    await fillIn('[data-test-filter-input]', 'title2');
    assert.dom(materials).exists({ count: 1 });
    assert.dom(firstLmTitle).hasText('title2');
  });

  test('filter by instructor', async function (assert) {
    assert.expect(5);

    this.set('materials', this.materials);
    this.set('filter', null);
    await render(hbs`<MyMaterials
      @filter={{this.filter}}
      @materials={{this.materials}}
      @sortBy="firstOfferingDate"
      @setCourseIdFilter={{(noop)}}
      @setFilter={{set this.filter}}
    />`);

    const table = 'table:nth-of-type(1)';
    const materials = `${table} tbody tr`;
    const firstLmTitle = `${materials}:nth-of-type(1) [data-test-title] a`;
    const secondLmTitle = `${materials}:nth-of-type(2) [data-test-title] a`;

    assert.dom(materials).exists({ count: 5 });
    assert.dom(firstLmTitle).hasText('title1');
    await fillIn('[data-test-filter-input]', 'instructor1name');
    assert.dom(materials).exists({ count: 2 });
    assert.dom(firstLmTitle).hasText('title1');
    assert.dom(secondLmTitle).hasText('title2');
  });

  test('filter by session title', async function (assert) {
    assert.expect(4);

    this.set('materials', this.materials);
    this.set('filter', null);
    await render(hbs`<MyMaterials
      @filter={{this.filter}}
      @materials={{this.materials}}
      @sortBy="firstOfferingDate"
      @setCourseIdFilter={{(noop)}}
      @setFilter={{set this.filter}}
    />`);

    const table = 'table:nth-of-type(1)';
    const materials = `${table} tbody tr`;
    const firstLmTitle = `${materials}:nth-of-type(1) [data-test-title] a`;

    assert.dom(materials).exists({ count: 5 });
    assert.dom(firstLmTitle).hasText('title1');
    await fillIn('[data-test-filter-input]', 'session2');
    assert.dom(materials).exists({ count: 1 });
    assert.dom(firstLmTitle).hasText('title2');
  });

  test('filter by course title', async function (assert) {
    assert.expect(4);

    this.set('materials', this.materials);
    this.set('filter', null);
    await render(hbs`<MyMaterials
      @filter={{this.filter}}
      @materials={{this.materials}}
      @sortBy="firstOfferingDate"
      @setCourseIdFilter={{(noop)}}
      @setFilter={{set this.filter}}
    />`);

    const table = 'table:nth-of-type(1)';
    const materials = `${table} tbody tr`;
    const firstLmTitle = `${materials}:nth-of-type(1) [data-test-title] a`;

    assert.dom(materials).exists({ count: 5 });
    assert.dom(firstLmTitle).hasText('title1');
    await fillIn('[data-test-filter-input]', 'course2');
    assert.dom(materials).exists({ count: 1 });
    assert.dom(firstLmTitle).hasText('title2');
  });

  test('filter by course', async function (assert) {
    assert.expect(4);

    this.set('materials', this.materials);
    this.setProperties({ course: '', filter: null });
    await render(hbs`<MyMaterials
      @courseIdFilter={{this.course}}
      @materials={{this.materials}}
      @sortBy="firstOfferingDate"
      @setCourseIdFilter={{set this.course}}
      @setFilter={{set this.filter}}
    />`);

    const table = 'table:nth-of-type(1)';
    const materials = `${table} tbody tr`;
    const firstLmTitle = `${materials}:nth-of-type(1) [data-test-title] a`;

    assert.dom(materials).exists({ count: 5 });
    assert.dom(firstLmTitle).hasText('title1');
    this.set('course', '2');
    assert.dom(materials).exists({ count: 1 });
    assert.dom(firstLmTitle).hasText('title2');
  });

  test('clicking sort fires action', async function (assert) {
    assert.expect(8);

    this.set('materials', this.materials);
    let count = 0;
    const sortBys = [
      'title',
      'title:desc',
      'courseTitle',
      'courseTitle:desc',
      'sessionTitle',
      'sessionTitle:desc',
      'firstOfferingDate',
      'firstOfferingDate:desc',
    ];
    this.set('setSortBy', (what) => {
      assert.strictEqual(what, sortBys[count]);
      this.set('sortBy', what);
      count++;
    });
    this.set('sortBy', 'firstOfferingDate');

    await render(hbs`<MyMaterials
      @materials={{this.materials}}
      @sortBy={{this.sortBy}}
      @setCourseIdFilter={{(noop)}}
      @setFilter={{(noop)}}
      @setSortBy={{action this.setSortBy}}
    />`);

    const table = 'table:nth-of-type(1)';
    const headers = `${table} thead th`;
    const title = `${headers}:nth-of-type(3) button`;
    const courseTitle = `${headers}:nth-of-type(2) button`;
    const sessionTitle = `${headers}:nth-of-type(1) button`;
    const firstOffering = `${headers}:nth-of-type(5) button`;
    await click(title);
    await click(title);
    await click(courseTitle);
    await click(courseTitle);
    await click(sessionTitle);
    await click(sessionTitle);
    await click(firstOffering);
    await click(firstOffering);
  });

  test('choosing course fires action', async function (assert) {
    assert.expect(3);

    this.set('materials', this.materials);
    let count = 0;
    const courses = ['1', '3', ''];
    this.set('setCourseIdFilter', (what) => {
      assert.strictEqual(what, courses[count]);
      this.set('courseIdFilter', what);
      count++;
    });
    this.set('courseIdFilter', null);

    await render(hbs`<MyMaterials
      @courseIdFilter={{this.courseIdFilter}}
      @materials={{this.materials}}
      @sortBy="firstOfferingDate"
      @setCourseIdFilter={{action this.setCourseIdFilter}}
      @setFilter={{(noop)}}
    />`);

    const select = '.course-filter select';
    await fillIn(select, '1');
    await fillIn(select, '3');
    await fillIn(select, '');
  });

  test('find with slash does not blow up on regex error', async function (assert) {
    assert.expect(3);

    this.set('materials', this.materials);
    this.setProperties({ filter: null, nothing: parseInt });
    await render(hbs`<MyMaterials
      @filter={{this.filter}}
      @materials={{this.materials}}
      @sortBy="firstOfferingDate"
      @setCourseIdFilter={{(noop)}}
      @setFilter={{set this.filter}}
    />`);

    const table = 'table:nth-of-type(1)';
    const materials = `${table} tbody tr`;
    const firstLmTitle = `${materials}:nth-of-type(1) [data-test-title] a`;

    assert.dom(materials).exists({ count: 5 });
    assert.dom(firstLmTitle).hasText('title1');
    await fillIn('[data-test-filter-input]', 'course2\\');
    assert.dom('[data-test-none]').exists();
  });
});
