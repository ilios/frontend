import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import {
  click,
  fillIn,
  find,
  render,
  settled,
  triggerEvent
} from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';
import { resolve } from 'rsvp';

module('Integration | Component | course materials', function(hooks) {
  setupRenderingTest(hooks);

  const COURSE_TABLE = '.table__course';
  const SESSION_TABLE = '.table__session';

  test('course lms render', async function(assert) {
    assert.expect(3);

    let lm1 = EmberObject.create({
      title: 'title1',
      description: 'description1',
      originalAuthor: 'author1',
      link: 'url1',
      type: 'link',
    });
    let courseLm1 = EmberObject.create({
      learningMaterial: resolve(lm1),
    });

    let course = EmberObject.create({
      sessions: resolve([]),
      learningMaterials: resolve([courseLm1])
    });
    courseLm1.set('course', resolve(course));

    this.setProperties({ clmSortBy: 'title', slmSortBy: 'firstOfferingDate' });
    this.set('course', course);
    await render(hbs`
      {{course-materials
        clmSortBy=clmSortBy
        course=course
        slmSortBy=slmSortBy}}`);

    const courseMaterials = `${COURSE_TABLE} tbody tr`;
    const firstCourseLmTitle = `${courseMaterials}:nth-of-type(1) td:nth-of-type(1)`;
    const firstCourseLmType = `${courseMaterials}:nth-of-type(1) td:nth-of-type(2)`;
    const firstCourseLmAuthor = `${courseMaterials}:nth-of-type(1) td:nth-of-type(3)`;

    assert.dom(firstCourseLmTitle).hasText('title1');
    assert.dom(firstCourseLmType).hasText('Link');
    assert.dom(firstCourseLmAuthor).hasText('author1');
    return settled();
  });

  let setupPage = function(){
    let lm1 = EmberObject.create({
      title: 'title1',
      description: 'description1',
      originalAuthor: 'author1',
      url: 'http://myhost.com/url1',
      type: 'link',
    });
    let lm2 = EmberObject.create({
      title: 'title2',
      description: 'description2',
      originalAuthor: 'author2',
      url: 'http://myhost.com/url2',
      type: 'file',
    });
    let lm3 = EmberObject.create({
      title: 'title3',
      description: 'description3',
      originalAuthor: 'author3',
      url: null,
      type: 'citation',
      citation: 'citationtext',
    });
    let course1 = EmberObject.create({
      learningMaterial: resolve(lm1),
    });
    let sessionLm1 = EmberObject.create({
      learningMaterial: resolve(lm1),
    });
    let sessionLm2 = EmberObject.create({
      learningMaterial: resolve(lm2),
    });
    let sessionLm3 = EmberObject.create({
      learningMaterial: resolve(lm3),
    });
    let session1 = EmberObject.create({
      title: 'session1title',
      learningMaterials: resolve([sessionLm1, sessionLm2, sessionLm3]),
      firstOfferingDate: resolve(new Date(2020, 1, 2, 12)),
    });
    sessionLm1.set('session', resolve(session1));
    sessionLm2.set('session', resolve(session1));
    sessionLm3.set('session', resolve(session1));

    let course = EmberObject.create({
      learningMaterials: resolve([course1]),
      sessions: resolve([session1])
    });
    return course;
  };

  test('course & session lms render', async function(assert) {
    assert.expect(22);

    let course = setupPage();
    this.set('nothing', parseInt);
    this.setProperties({ clmSortBy: 'title', slmSortBy: 'firstOfferingDate' });
    this.set('course', course);
    await render(hbs`
      {{course-materials
        clmSortBy=clmSortBy
        course=course
        slmSortBy=slmSortBy
        onSlmSort=(action nothing)}}`);

    const courseMaterials = `${COURSE_TABLE} tbody tr`;
    const firstCourseLmTitle = `${courseMaterials}:nth-of-type(1) td:nth-of-type(1)`;
    const firstCourseLmLink = `${firstCourseLmTitle} a`;
    const firstCourseLmType = `${courseMaterials}:nth-of-type(1) td:nth-of-type(2)`;
    const firstCourseLmAuthor = `${courseMaterials}:nth-of-type(1) td:nth-of-type(3)`;

    const sessionMaterials = `${SESSION_TABLE} tbody tr`;
    const firstSessionLmTitle = `${sessionMaterials}:nth-of-type(1) td:nth-of-type(1)`;
    const firstSessionLmLink = `${firstSessionLmTitle} a`;
    const firstSessionLmType = `${sessionMaterials}:nth-of-type(1) td:nth-of-type(2)`;
    const firstSessionLmAuthor = `${sessionMaterials}:nth-of-type(1) td:nth-of-type(3)`;
    const firstSessionLmSessionTitle = `${sessionMaterials}:nth-of-type(1) td:nth-of-type(4)`;
    const firstSessionLmFirstOffering = `${sessionMaterials}:nth-of-type(1) td:nth-of-type(5)`;

    const secondSessionLmTitle = `${sessionMaterials}:nth-of-type(2) td:nth-of-type(1)`;
    const secondSessionLmLink = `${secondSessionLmTitle} a`;
    const secondSessionLmType = `${sessionMaterials}:nth-of-type(2) td:nth-of-type(2)`;
    const secondSessionLmAuthor = `${sessionMaterials}:nth-of-type(2) td:nth-of-type(3)`;
    const secondSessionLmSessionTitle = `${sessionMaterials}:nth-of-type(2) td:nth-of-type(4)`;
    const secondSessionLmsecondOffering = `${sessionMaterials}:nth-of-type(2) td:nth-of-type(5)`;

    const thirdSessionLmTitle = `${sessionMaterials}:nth-of-type(3) td:nth-of-type(1)`;
    const thirdSessionLmLink = `${thirdSessionLmTitle} a`;
    const thirdSessionLmType = `${sessionMaterials}:nth-of-type(3) td:nth-of-type(2)`;
    const thirdSessionLmAuthor = `${sessionMaterials}:nth-of-type(3) td:nth-of-type(3)`;
    const thirdSessionLmSessionTitle = `${sessionMaterials}:nth-of-type(3) td:nth-of-type(4)`;
    const thirdSessionLmsecondOffering = `${sessionMaterials}:nth-of-type(3) td:nth-of-type(5)`;

    assert.dom(firstCourseLmTitle).hasText('title1');
    assert.equal(find(firstCourseLmLink).getAttribute('href').trim(), 'http://myhost.com/url1');
    assert.dom(firstCourseLmType).hasText('Link');
    assert.dom(firstCourseLmAuthor).hasText('author1');

    assert.dom(firstSessionLmTitle).hasText('title1');
    assert.equal(find(firstSessionLmLink).getAttribute('href').trim(), 'http://myhost.com/url1');
    assert.dom(firstSessionLmType).hasText('Link');
    assert.dom(firstSessionLmAuthor).hasText('author1');
    assert.dom(firstSessionLmSessionTitle).hasText('session1title');
    assert.dom(firstSessionLmFirstOffering).hasText('02/02/2020');

    assert.dom(secondSessionLmTitle).hasText('title2');
    assert.equal(find(secondSessionLmLink).getAttribute('href').trim(), 'http://myhost.com/url2');
    assert.dom(secondSessionLmType).hasText('File');
    assert.dom(secondSessionLmAuthor).hasText('author2');
    assert.dom(secondSessionLmSessionTitle).hasText('session1title');
    assert.dom(secondSessionLmsecondOffering).hasText('02/02/2020');

    assert.equal(find(thirdSessionLmTitle).textContent.replace(/[\t\n\s]+/g, ""), 'title3citationtext');
    assert.dom(thirdSessionLmLink).doesNotExist();
    assert.dom(thirdSessionLmType).hasText('Citation');
    assert.dom(thirdSessionLmAuthor).hasText('author3');
    assert.dom(thirdSessionLmSessionTitle).hasText('session1title');
    assert.dom(thirdSessionLmsecondOffering).hasText('02/02/2020');
    return settled();
  });

  test('clicking sort fires action', async function(assert) {
    assert.expect(16);

    let course = setupPage();
    let cCount = 0, sCount = 0;
    const cSortList = [
      'title:desc', 'title', 'type', 'type:desc', 'author', 'author:desc'
    ];
    const sSortList = [
      'title', 'title:desc', 'type', 'type:desc', 'author', 'author:desc',
      'sessionTitle', 'sessionTitle:desc', 'firstOfferingDate',
      'firstOfferingDate:desc'
    ];
    this.set('cSortBy', (prop) => {
      assert.equal(prop, cSortList[cCount]);
      this.set('clmSortBy', prop);
      cCount++;
    });
    this.set('sSortBy', (prop) => {
      assert.equal(prop, sSortList[sCount]);
      this.set('slmSortBy', prop);
      sCount++;
    });
    this.setProperties({ clmSortBy: 'title', slmSortBy: 'firstOfferingDate' });
    this.set('course', course);

    await render(hbs`
      {{course-materials
        clmSortBy=clmSortBy
        course=course
        slmSortBy=slmSortBy
        onClmSort=(action cSortBy)
        onSlmSort=(action sSortBy)}}`);

    const cHeaders = `${COURSE_TABLE} thead th`;
    const cTitle = `${cHeaders}:nth-of-type(1)`;
    const cType = `${cHeaders}:nth-of-type(2)`;
    const cAuthor = `${cHeaders}:nth-of-type(3)`;
    const sHeaders = `${SESSION_TABLE} thead th`;
    const sTitle = `${sHeaders}:nth-of-type(1)`;
    const sType = `${sHeaders}:nth-of-type(2)`;
    const sAuthor = `${sHeaders}:nth-of-type(3)`;
    const sSessionTitle = `${sHeaders}:nth-of-type(4)`;
    const sFirstOffering = `${sHeaders}:nth-of-type(5)`;

    await click(cTitle);
    await click(cTitle);
    await click(cType);
    await click(cType);
    await click(cAuthor);
    await click(cAuthor);
    await click(sTitle);
    await click(sTitle);
    await click(sType);
    await click(sType);
    await click(sAuthor);
    await click(sAuthor);
    await click(sSessionTitle);
    await click(sSessionTitle);
    await click(sFirstOffering);
    await click(sFirstOffering);
    return settled();
  });

  test('filter by title', async function(assert) {
    assert.expect(3);

    let course = setupPage();
    this.setProperties({ clmSortBy: 'title', slmSortBy: 'firstOfferingDate' });
    this.set('course', course);

    await render(hbs`
      {{course-materials
        clmSortBy=clmSortBy
        course=course
        slmSortBy=slmSortBy}}`);

    const sessionMaterials = `${SESSION_TABLE} tbody tr`;
    const firstSessionLmTitle = `${sessionMaterials}:nth-of-type(1) td:nth-of-type(1)`;
    const filter = '.filter-session-lms input';

    assert.dom(sessionMaterials).exists({ count: 3 });
    await fillIn(filter, 'title1');
    await triggerEvent(filter, 'input');
    assert.dom(sessionMaterials).exists({ count: 1 });
    assert.dom(firstSessionLmTitle).hasText('title1');
    return settled();
  });

  test('filter by type', async function(assert) {
    assert.expect(3);

    let course = setupPage();
    this.setProperties({ clmSortBy: 'title', slmSortBy: 'firstOfferingDate' });
    this.set('course', course);

    await render(hbs`
      {{course-materials
        clmSortBy=clmSortBy
        course=course
        slmSortBy=slmSortBy}}`);

    const sessionMaterials = `${SESSION_TABLE} tbody tr`;
    const firstSessionLmTitle = `${sessionMaterials}:nth-of-type(1) td:nth-of-type(1)`;
    const filter = '.filter-session-lms input';

    assert.dom(sessionMaterials).exists({ count: 3 });
    await fillIn(filter, 'file');
    await triggerEvent(filter, 'input');
    assert.dom(sessionMaterials).exists({ count: 1 });
    assert.dom(firstSessionLmTitle).hasText('title2');
    return settled();
  });

  test('filter by author', async function(assert) {
    assert.expect(3);

    let course = setupPage();
    this.setProperties({ clmSortBy: 'title', slmSortBy: 'firstOfferingDate' });
    this.set('course', course);

    await render(hbs`
      {{course-materials
        clmSortBy=clmSortBy
        course=course
        slmSortBy=slmSortBy}}`);

    const sessionMaterials = `${SESSION_TABLE} tbody tr`;
    const firstSessionLmTitle = `${sessionMaterials}:nth-of-type(1) td:nth-of-type(1)`;
    const filter = '.filter-session-lms input';

    assert.dom(sessionMaterials).exists({ count: 3 });
    await fillIn(filter, 'author2');
    await triggerEvent(filter, 'input');
    assert.dom(sessionMaterials).exists({ count: 1 });
    assert.dom(firstSessionLmTitle).hasText('title2');
    return settled();
  });

  test('filter by citation', async function(assert) {
    assert.expect(3);

    let course = setupPage();
    this.setProperties({ clmSortBy: 'title', slmSortBy: 'firstOfferingDate' });
    this.set('course', course);

    await render(hbs`
      {{course-materials
        clmSortBy=clmSortBy
        course=course
        slmSortBy=slmSortBy}}`);

    const sessionTable = SESSION_TABLE;
    const sessionMaterials = `${sessionTable} tbody tr`;
    const firstSessionLmTitle = `${sessionMaterials}:nth-of-type(1) td:nth-of-type(1)`;
    const filter = '.filter-session-lms input';

    assert.dom(sessionMaterials).exists({ count: 3 });
    await fillIn(filter, 'citationtext');
    await triggerEvent(filter, 'input');
    assert.dom(sessionMaterials).exists({ count: 1 });
    assert.equal(find(firstSessionLmTitle).textContent.replace(/[\t\n\s]+/g, ""), 'title3citationtext');
    return settled();
  });
});
