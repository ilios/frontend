import EmberObject from '@ember/object';
import RSVP from 'rsvp';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render, settled, fillIn, triggerEvent, find, findAll } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

const { resolve } = RSVP;

module('Integration | Component | course materials', function(hooks) {
  setupRenderingTest(hooks);

  test('course lms render', async function(assert) {
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

    this.set('nothing', parseInt);
    this.set('sortBy', 'firstOfferingDate');
    this.set('course', course);
    await render(hbs`{{course-materials setSortBy=(action nothing) sortBy=sortBy course=course}}`);

    const courseTable = 'table:nth-of-type(1)';
    const courseMaterials = `${courseTable} tbody tr`;
    const firstCourseLmTitle = `${courseMaterials}:nth-of-type(1) td:nth-of-type(1)`;
    const firstCourseLmType = `${courseMaterials}:nth-of-type(1) td:nth-of-type(2)`;
    const firstCourseLmAuthor = `${courseMaterials}:nth-of-type(1) td:nth-of-type(3)`;

    assert.equal(find(firstCourseLmTitle).textContent.trim(), 'title1');
    assert.equal(find(firstCourseLmType).textContent.trim(), 'link');
    assert.equal(find(firstCourseLmAuthor).textContent.trim(), 'author1');

    return settled();

  });

  let setupSessionLms = function(){
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
      sessions: resolve([session1])
    });

    return course;
  };

  test('session lms render', async function(assert) {
    let course = setupSessionLms();

    this.set('nothing', parseInt);
    this.set('sortBy', 'firstOfferingDate');
    this.set('course', course);
    await render(hbs`{{course-materials setSortBy=(action nothing) sortBy=sortBy course=course}}`);

    const sessionTable = 'table:nth-of-type(1)';
    const sessionMaterials = `${sessionTable} tbody tr`;
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

    assert.equal(find(firstSessionLmTitle).textContent.trim(), 'title1');
    assert.equal(find(firstSessionLmLink).getAttribute('href').trim(), 'http://myhost.com/url1');
    assert.equal(find(firstSessionLmType).textContent.trim(), 'link');
    assert.equal(find(firstSessionLmAuthor).textContent.trim(), 'author1');
    assert.equal(find(firstSessionLmSessionTitle).textContent.trim(), 'session1title');
    assert.equal(find(firstSessionLmFirstOffering).textContent.trim(), '02/02/2020');

    assert.equal(find(secondSessionLmTitle).textContent.trim(), 'title2');
    assert.equal(find(secondSessionLmLink).getAttribute('href').trim(), 'http://myhost.com/url2');
    assert.equal(find(secondSessionLmType).textContent.trim(), 'file');
    assert.equal(find(secondSessionLmAuthor).textContent.trim(), 'author2');
    assert.equal(find(secondSessionLmSessionTitle).textContent.trim(), 'session1title');
    assert.equal(find(secondSessionLmsecondOffering).textContent.trim(), '02/02/2020');

    assert.equal(find(thirdSessionLmTitle).textContent.replace(/[\t\n\s]+/g, ""), 'title3citationtext');
    assert.equal(findAll(thirdSessionLmLink).length, 0);
    assert.equal(find(thirdSessionLmType).textContent.trim(), 'citation');
    assert.equal(find(thirdSessionLmAuthor).textContent.trim(), 'author3');
    assert.equal(find(thirdSessionLmSessionTitle).textContent.trim(), 'session1title');
    assert.equal(find(thirdSessionLmsecondOffering).textContent.trim(), '02/02/2020');

    return settled();

  });

  test('clicking sort fires action', async function(assert) {
    assert.expect(10);
    let course = setupSessionLms();

    let count = 0;
    let sortBys = ['title', 'title:desc', 'type', 'type:desc', 'author', 'author:desc', 'sessionTitle', 'sessionTitle:desc', 'firstOfferingDate', 'firstOfferingDate:desc'];
    this.set('setSortBy', (what) => {
      assert.equal(what, sortBys[count]);
      this.set('sortBy', what);

      count++;
    });

    this.set('sortBy', 'firstOfferingDate');
    this.set('course', course);

    await render(hbs`{{course-materials setSortBy=(action setSortBy) sortBy=sortBy course=course}}`);

    const sessionTable = 'table:nth-of-type(1)';
    const headers = `${sessionTable} thead th`;
    const title = `${headers}:nth-of-type(1)`;
    const type = `${headers}:nth-of-type(2)`;
    const author = `${headers}:nth-of-type(3)`;
    const sessionTitle = `${headers}:nth-of-type(4)`;
    const firstOffering = `${headers}:nth-of-type(5)`;

    await click(title);
    await click(title);
    await click(type);
    await click(type);
    await click(author);
    await click(author);
    await click(sessionTitle);
    await click(sessionTitle);
    await click(firstOffering);
    await click(firstOffering);

    return settled();

  });

  test('filter by title', async function(assert) {
    assert.expect(3);
    let course = setupSessionLms();

    this.set('sortBy', 'firstOfferingDate');
    this.set('nothing', ()=>{});
    this.set('course', course);

    await render(hbs`{{course-materials setSortBy=(action nothing) sortBy=sortBy course=course}}`);

    const sessionTable = 'table:nth-of-type(1)';
    const sessionMaterials = `${sessionTable} tbody tr`;
    const firstSessionLmTitle = `${sessionMaterials}:nth-of-type(1) td:nth-of-type(1)`;
    const filter = '.filter-session-lms input';

    assert.equal(findAll(sessionMaterials).length, 3);
    await fillIn(filter, 'title1');
    await triggerEvent(filter, 'input');
    assert.equal(findAll(sessionMaterials).length, 1);
    assert.equal(find(firstSessionLmTitle).textContent.trim(), 'title1');

    return settled();

  });

  test('filter by type', async function(assert) {
    assert.expect(3);
    let course = setupSessionLms();

    this.set('sortBy', 'firstOfferingDate');
    this.set('nothing', ()=>{});
    this.set('course', course);

    await render(hbs`{{course-materials setSortBy=(action nothing) sortBy=sortBy course=course}}`);

    const sessionTable = 'table:nth-of-type(1)';
    const sessionMaterials = `${sessionTable} tbody tr`;
    const firstSessionLmTitle = `${sessionMaterials}:nth-of-type(1) td:nth-of-type(1)`;
    const filter = '.filter-session-lms input';

    assert.equal(findAll(sessionMaterials).length, 3);
    await fillIn(filter, 'file');
    await triggerEvent(filter, 'input');
    assert.equal(findAll(sessionMaterials).length, 1);
    assert.equal(find(firstSessionLmTitle).textContent.trim(), 'title2');

    return settled();

  });

  test('filter by author', async function(assert) {
    assert.expect(3);
    let course = setupSessionLms();

    this.set('sortBy', 'firstOfferingDate');
    this.set('nothing', ()=>{});
    this.set('course', course);

    await render(hbs`{{course-materials setSortBy=(action nothing) sortBy=sortBy course=course}}`);

    const sessionTable = 'table:nth-of-type(1)';
    const sessionMaterials = `${sessionTable} tbody tr`;
    const firstSessionLmTitle = `${sessionMaterials}:nth-of-type(1) td:nth-of-type(1)`;
    const filter = '.filter-session-lms input';

    assert.equal(findAll(sessionMaterials).length, 3);
    await fillIn(filter, 'author2');
    await triggerEvent(filter, 'input');
    assert.equal(findAll(sessionMaterials).length, 1);
    assert.equal(find(firstSessionLmTitle).textContent.trim(), 'title2');

    return settled();

  });

  test('filter by citation', async function(assert) {
    assert.expect(3);
    let course = setupSessionLms();

    this.set('sortBy', 'firstOfferingDate');
    this.set('nothing', ()=>{});
    this.set('course', course);

    await render(hbs`{{course-materials setSortBy=(action nothing) sortBy=sortBy course=course}}`);

    const sessionTable = 'table:nth-of-type(1)';
    const sessionMaterials = `${sessionTable} tbody tr`;
    const firstSessionLmTitle = `${sessionMaterials}:nth-of-type(1) td:nth-of-type(1)`;
    const filter = '.filter-session-lms input';

    assert.equal(findAll(sessionMaterials).length, 3);
    await fillIn(filter, 'citationtext');
    await triggerEvent(filter, 'input');
    assert.equal(findAll(sessionMaterials).length, 1);
    assert.equal(find(firstSessionLmTitle).textContent.replace(/[\t\n\s]+/g, ""), 'title3citationtext');

    return settled();

  });
});
