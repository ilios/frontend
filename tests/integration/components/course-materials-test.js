import { module, test } from 'qunit';
import { hbs } from 'ember-cli-htmlbars';
import { setupRenderingTest } from 'dummy/tests/helpers';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { component } from 'ilios-common/page-objects/components/course-materials';

module('Integration | Component | course materials', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  test('course lms render', async function (assert) {
    assert.expect(4);

    const lm1 = this.server.create('learning-material', {
      title: 'title1',
      description: 'description1',
      originalAuthor: 'author1',
      link: 'url1',
      type: 'link',
    });
    const courseLm1 = this.server.create('course-learning-material', {
      learningMaterial: lm1,
    });

    const course = this.server.create('course', {
      learningMaterials: [courseLm1],
    });
    const courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);

    this.setProperties({
      course: courseModel,
      courseSort: 'title',
      sessionSort: 'firstOfferingDate',
    });
    await render(hbs`<CourseMaterials
      @course={{this.course}}
      @courseSort={{this.courseSort}}
      @sessionSort={{this.sessionSort}}
    />
`);

    assert.strictEqual(component.courses.length, 1);
    assert.strictEqual(component.courses[0].title, 'title1');
    assert.strictEqual(component.courses[0].type, 'Link');
    assert.strictEqual(component.courses[0].author, 'author1');
  });

  const setupPage = async function (context) {
    const lm1 = context.server.create('learning-material', {
      title: 'title1',
      description: 'description1',
      originalAuthor: 'author1',
      link: 'http://myhost.com/url1',
    });
    const lm2 = context.server.create('learning-material', {
      title: 'title2',
      description: 'description2',
      originalAuthor: 'author2',
      filename: 'testfile.txt',
      absoluteFileUri: 'http://myhost.com/url2',
    });
    const lm3 = context.server.create('learning-material', {
      title: 'title3',
      description: 'description3',
      originalAuthor: 'author3',
      citation: 'citationtext',
    });

    const courseLm1 = context.server.create('course-learning-material', {
      learningMaterial: lm1,
    });
    const courseLm2 = context.server.create('course-learning-material', {
      learningMaterial: lm2,
    });
    const courseLm3 = context.server.create('course-learning-material', {
      learningMaterial: lm3,
    });
    const session = context.server.create('session', {
      title: 'session1title',
    });
    context.server.create('session-learning-material', {
      session,
      learningMaterial: lm1,
    });
    context.server.create('session-learning-material', {
      session,
      learningMaterial: lm2,
    });
    context.server.create('session-learning-material', {
      session,
      learningMaterial: lm3,
    });
    context.server.create('offering', {
      session,
      startDate: new Date(2020, 1, 2, 12).toISOString(),
      endDate: new Date(2020, 1, 2, 14).toISOString(),
    });

    const course = context.server.create('course', {
      sessions: [session],
      learningMaterials: [courseLm1, courseLm2, courseLm3],
    });

    return context.owner.lookup('service:store').findRecord('course', course.id);
  };

  test('course & session lms render', async function (assert) {
    assert.expect(29);

    const course = await setupPage(this);
    this.setProperties({
      course,
      courseSort: 'title',
      sessionSort: 'firstOfferingDate',
    });
    await render(hbs`<CourseMaterials
      @course={{this.course}}
      @courseSort={{this.courseSort}}
      @sessionSort={{this.sessionSort}}
      @onSessionSort={{(noop)}}
    />
`);

    assert.strictEqual(component.courses.length, 3);
    assert.strictEqual(component.courses[0].title, 'title1');
    assert.ok(component.courses[0].hasLink);
    assert.strictEqual(component.courses[0].link, 'http://myhost.com/url1');
    assert.strictEqual(component.courses[0].type, 'Link');
    assert.strictEqual(component.courses[0].author, 'author1');

    assert.strictEqual(component.sessions.length, 3);
    assert.strictEqual(component.sessions[0].title, 'title1');
    assert.ok(component.sessions[0].hasLink);
    assert.strictEqual(component.sessions[0].link, 'http://myhost.com/url1');
    assert.strictEqual(component.sessions[0].type, 'Link');
    assert.strictEqual(component.sessions[0].author, 'author1');
    assert.strictEqual(component.sessions[0].sessionTitle, 'session1title');
    assert.strictEqual(component.sessions[0].firstOffering, '2/2/2020');

    assert.strictEqual(component.sessions.length, 3);
    assert.strictEqual(component.sessions[1].title, 'title2');
    assert.ok(component.sessions[1].hasLink);
    assert.strictEqual(component.sessions[1].link, 'http://myhost.com/url2');
    assert.strictEqual(component.sessions[1].type, 'File');
    assert.strictEqual(component.sessions[1].author, 'author2');
    assert.strictEqual(component.sessions[1].sessionTitle, 'session1title');
    assert.strictEqual(component.sessions[1].firstOffering, '2/2/2020');

    assert.strictEqual(component.sessions.length, 3);
    assert.strictEqual(component.sessions[2].title, 'title3 citationtext');
    assert.notOk(component.sessions[2].hasLink);
    assert.strictEqual(component.sessions[2].type, 'Citation');
    assert.strictEqual(component.sessions[2].author, 'author3');
    assert.strictEqual(component.sessions[2].sessionTitle, 'session1title');
    assert.strictEqual(component.sessions[2].firstOffering, '2/2/2020');
  });

  test('clicking sort fires action', async function (assert) {
    assert.expect(16);

    const course = await setupPage(this);
    let cCount = 0,
      sCount = 0;
    const cSortList = [
      'title:desc',
      'title',
      'type',
      'type:desc',
      'originalAuthor',
      'originalAuthor:desc',
    ];
    const sSortList = [
      'lm.title',
      'lm.title:desc',
      'lm.type',
      'lm.type:desc',
      'lm.originalAuthor',
      'lm.originalAuthor:desc',
      'session.title',
      'session.title:desc',
      'session.firstOfferingDate',
      'session.firstOfferingDate:desc',
    ];
    this.set('cSortBy', (prop) => {
      assert.strictEqual(prop, cSortList[cCount]);
      this.set('courseSort', prop);
      cCount++;
    });
    this.set('sSortBy', (prop) => {
      assert.strictEqual(prop, sSortList[sCount]);
      this.set('sessionSort', prop);
      sCount++;
    });
    this.setProperties({
      course,
      courseSort: 'title',
      sessionSort: 'session.firstOfferingDate',
    });

    await render(hbs`<CourseMaterials
      @course={{this.course}}
      @courseSort={{this.courseSort}}
      @sessionSort={{this.sessionSort}}
      @onCourseSort={{this.cSortBy}}
      @onSessionSort={{this.sSortBy}}
    />
`);
    await component.sortCoursesBy.title();
    await component.sortCoursesBy.title();
    await component.sortCoursesBy.type();
    await component.sortCoursesBy.type();
    await component.sortCoursesBy.author();
    await component.sortCoursesBy.author();

    await component.sortSessionsBy.title();
    await component.sortSessionsBy.title();
    await component.sortSessionsBy.type();
    await component.sortSessionsBy.type();
    await component.sortSessionsBy.author();
    await component.sortSessionsBy.author();
    await component.sortSessionsBy.sessionTitle();
    await component.sortSessionsBy.sessionTitle();
    await component.sortSessionsBy.firstOffering();
    await component.sortSessionsBy.firstOffering();
  });

  test('filter course lms by title', async function (assert) {
    assert.expect(3);

    const course = await setupPage(this);
    this.setProperties({
      course,
      courseSort: 'title',
      sessionSort: 'firstOfferingDate',
    });

    await render(hbs`<CourseMaterials
      @course={{this.course}}
      @courseSort={{this.courseSort}}
      @sessionSort={{this.sessionSort}}
    />
`);

    assert.strictEqual(component.courses.length, 3);
    await component.courseFilter('title1');
    assert.strictEqual(component.courses.length, 1);
    assert.strictEqual(component.courses[0].title, 'title1');
  });

  test('filter course lms by type', async function (assert) {
    assert.expect(3);

    const course = await setupPage(this);
    this.setProperties({
      course,
      courseSort: 'title',
      sessionSort: 'firstOfferingDate',
    });

    await render(hbs`<CourseMaterials
      @course={{this.course}}
      @courseSort={{this.courseSort}}
      @sessionSort={{this.sessionSort}}
    />
`);

    assert.strictEqual(component.courses.length, 3);
    await component.courseFilter('file');
    assert.strictEqual(component.courses.length, 1);
    assert.strictEqual(component.courses[0].title, 'title2');
  });

  test('filter course lms by author', async function (assert) {
    assert.expect(3);

    const course = await setupPage(this);
    this.setProperties({
      course,
      courseSort: 'title',
      sessionSort: 'firstOfferingDate',
    });

    await render(hbs`<CourseMaterials
      @course={{this.course}}
      @courseSort={{this.courseSort}}
      @sessionSort={{this.sessionSort}}
    />
`);

    assert.strictEqual(component.courses.length, 3);
    await component.courseFilter('author2');
    assert.strictEqual(component.courses.length, 1);
    assert.strictEqual(component.courses[0].title, 'title2');
  });

  test('filter course lms by citation', async function (assert) {
    assert.expect(3);

    const course = await setupPage(this);
    this.setProperties({
      course,
      courseSort: 'title',
      sessionSort: 'firstOfferingDate',
    });

    await render(hbs`<CourseMaterials
      @course={{this.course}}
      @courseSort={{this.courseSort}}
      @sessionSort={{this.sessionSort}}
    />
`);

    assert.strictEqual(component.courses.length, 3);
    await component.courseFilter('citationtext');
    assert.strictEqual(component.courses.length, 1);
    assert.strictEqual(component.courses[0].title, 'title3 citationtext');
  });

  test('filter session lms by title', async function (assert) {
    assert.expect(3);

    const course = await setupPage(this);
    this.setProperties({
      course,
      courseSort: 'title',
      sessionSort: 'firstOfferingDate',
    });

    await render(hbs`<CourseMaterials
      @course={{this.course}}
      @courseSort={{this.courseSort}}
      @sessionSort={{this.sessionSort}}
    />
`);

    assert.strictEqual(component.sessions.length, 3);
    await component.sessionFilter('title1');
    assert.strictEqual(component.sessions.length, 1);
    assert.strictEqual(component.sessions[0].title, 'title1');
  });

  test('filter session lms by type', async function (assert) {
    assert.expect(3);

    const course = await setupPage(this);
    this.setProperties({
      course,
      courseSort: 'title',
      sessionSort: 'firstOfferingDate',
    });

    await render(hbs`<CourseMaterials
      @course={{this.course}}
      @courseSort={{this.courseSort}}
      @sessionSort={{this.sessionSort}}
    />
`);

    assert.strictEqual(component.sessions.length, 3);
    await component.sessionFilter('file');
    assert.strictEqual(component.sessions.length, 1);
    assert.strictEqual(component.sessions[0].title, 'title2');
  });

  test('filter session lms by author', async function (assert) {
    assert.expect(3);

    const course = await setupPage(this);
    this.setProperties({
      course,
      courseSort: 'title',
      sessionSort: 'firstOfferingDate',
    });

    await render(hbs`<CourseMaterials
      @course={{this.course}}
      @courseSort={{this.courseSort}}
      @sessionSort={{this.sessionSort}}
    />
`);

    assert.strictEqual(component.sessions.length, 3);
    await component.sessionFilter('author2');
    assert.strictEqual(component.sessions.length, 1);
    assert.strictEqual(component.sessions[0].title, 'title2');
  });

  test('filter session lms by citation', async function (assert) {
    assert.expect(3);

    const course = await setupPage(this);
    this.setProperties({
      course,
      courseSort: 'title',
      sessionSort: 'firstOfferingDate',
    });

    await render(hbs`<CourseMaterials
      @course={{this.course}}
      @courseSort={{this.courseSort}}
      @sessionSort={{this.sessionSort}}
    />
`);

    assert.strictEqual(component.sessions.length, 3);
    await component.sessionFilter('citationtext');
    assert.strictEqual(component.sessions.length, 1);
    assert.strictEqual(component.sessions[0].title, 'title3 citationtext');
  });

  test('no materials', async function (assert) {
    const course = this.server.create('course');
    const courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);
    this.set('course', courseModel);

    await render(hbs`<CourseMaterials
      @course={{this.course}}
      @courseSort={{(noop)}}
      @sessionSort={{(noop)}}
    />
`);

    assert.strictEqual(component.courses.length, 1);
    assert.strictEqual(component.courses[0].title, 'No Course Learning Materials Available');
    assert.strictEqual(component.sessions.length, 1);
    assert.strictEqual(component.sessions[0].title, 'No Session Learning Materials Available');
  });
});
