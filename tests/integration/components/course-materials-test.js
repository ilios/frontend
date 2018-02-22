import EmberObject from '@ember/object';
import RSVP from 'rsvp';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled } from '@ember/test-helpers';
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

    const courseTable = 'table:eq(0)';
    const courseMaterials = `${courseTable} tbody tr`;
    const firstCourseLmTitle = `${courseMaterials}:eq(0) td:eq(0)`;
    const firstCourseLmType = `${courseMaterials}:eq(0) td:eq(1)`;
    const firstCourseLmAuthor = `${courseMaterials}:eq(0) td:eq(2)`;

    assert.equal(this.$(firstCourseLmTitle).text().trim(), 'title1');
    assert.equal(this.$(firstCourseLmType).text().trim(), 'link');
    assert.equal(this.$(firstCourseLmAuthor).text().trim(), 'author1');

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

    const sessionTable = 'table:eq(0)';
    const sessionMaterials = `${sessionTable} tbody tr`;
    const firstSessionLmTitle = `${sessionMaterials}:eq(0) td:eq(0)`;
    const firstSessionLmLink = `${firstSessionLmTitle} a`;
    const firstSessionLmType = `${sessionMaterials}:eq(0) td:eq(1)`;
    const firstSessionLmAuthor = `${sessionMaterials}:eq(0) td:eq(2)`;
    const firstSessionLmSessionTitle = `${sessionMaterials}:eq(0) td:eq(3)`;
    const firstSessionLmFirstOffering = `${sessionMaterials}:eq(0) td:eq(4)`;

    const secondSessionLmTitle = `${sessionMaterials}:eq(1) td:eq(0)`;
    const secondSessionLmLink = `${secondSessionLmTitle} a`;
    const secondSessionLmType = `${sessionMaterials}:eq(1) td:eq(1)`;
    const secondSessionLmAuthor = `${sessionMaterials}:eq(1) td:eq(2)`;
    const secondSessionLmSessionTitle = `${sessionMaterials}:eq(1) td:eq(3)`;
    const secondSessionLmsecondOffering = `${sessionMaterials}:eq(1) td:eq(4)`;

    const thirdSessionLmTitle = `${sessionMaterials}:eq(2) td:eq(0)`;
    const thirdSessionLmLink = `${thirdSessionLmTitle} a`;
    const thirdSessionLmType = `${sessionMaterials}:eq(2) td:eq(1)`;
    const thirdSessionLmAuthor = `${sessionMaterials}:eq(2) td:eq(2)`;
    const thirdSessionLmSessionTitle = `${sessionMaterials}:eq(2) td:eq(3)`;
    const thirdSessionLmsecondOffering = `${sessionMaterials}:eq(2) td:eq(4)`;

    assert.equal(this.$(firstSessionLmTitle).text().trim(), 'title1');
    assert.equal(this.$(firstSessionLmLink).prop('href').trim(), 'http://myhost.com/url1');
    assert.equal(this.$(firstSessionLmType).text().trim(), 'link');
    assert.equal(this.$(firstSessionLmAuthor).text().trim(), 'author1');
    assert.equal(this.$(firstSessionLmSessionTitle).text().trim(), 'session1title');
    assert.equal(this.$(firstSessionLmFirstOffering).text().trim(), '02/02/2020');

    assert.equal(this.$(secondSessionLmTitle).text().trim(), 'title2');
    assert.equal(this.$(secondSessionLmLink).prop('href').trim(), 'http://myhost.com/url2');
    assert.equal(this.$(secondSessionLmType).text().trim(), 'file');
    assert.equal(this.$(secondSessionLmAuthor).text().trim(), 'author2');
    assert.equal(this.$(secondSessionLmSessionTitle).text().trim(), 'session1title');
    assert.equal(this.$(secondSessionLmsecondOffering).text().trim(), '02/02/2020');

    assert.equal(this.$(thirdSessionLmTitle).text().replace(/[\t\n\s]+/g, ""), 'title3citationtext');
    assert.equal(this.$(thirdSessionLmLink).length, 0);
    assert.equal(this.$(thirdSessionLmType).text().trim(), 'citation');
    assert.equal(this.$(thirdSessionLmAuthor).text().trim(), 'author3');
    assert.equal(this.$(thirdSessionLmSessionTitle).text().trim(), 'session1title');
    assert.equal(this.$(thirdSessionLmsecondOffering).text().trim(), '02/02/2020');

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

    const sessionTable = 'table:eq(0)';
    const headers = `${sessionTable} thead th`;
    const title = `${headers}:eq(0)`;
    const type = `${headers}:eq(1)`;
    const author = `${headers}:eq(2)`;
    const sessionTitle = `${headers}:eq(3)`;
    const firstOffering = `${headers}:eq(4)`;

    this.$(title).click();
    this.$(title).click();
    this.$(type).click();
    this.$(type).click();
    this.$(author).click();
    this.$(author).click();
    this.$(sessionTitle).click();
    this.$(sessionTitle).click();
    this.$(firstOffering).click();
    this.$(firstOffering).click();

    return settled();

  });

  test('filter by title', async function(assert) {
    assert.expect(3);
    let course = setupSessionLms();

    this.set('sortBy', 'firstOfferingDate');
    this.set('nothing', ()=>{});
    this.set('course', course);

    await render(hbs`{{course-materials setSortBy=(action nothing) sortBy=sortBy course=course}}`);

    const sessionTable = 'table:eq(0)';
    const sessionMaterials = `${sessionTable} tbody tr`;
    const firstSessionLmTitle = `${sessionMaterials}:eq(0) td:eq(0)`;
    const filter = '.filter-session-lms input';

    assert.equal(this.$(sessionMaterials).length, 3);
    this.$(filter).val('title1');
    this.$(filter).trigger('input');
    assert.equal(this.$(sessionMaterials).length, 1);
    assert.equal(this.$(firstSessionLmTitle).text().trim(), 'title1');

    return settled();

  });

  test('filter by type', async function(assert) {
    assert.expect(3);
    let course = setupSessionLms();

    this.set('sortBy', 'firstOfferingDate');
    this.set('nothing', ()=>{});
    this.set('course', course);

    await render(hbs`{{course-materials setSortBy=(action nothing) sortBy=sortBy course=course}}`);

    const sessionTable = 'table:eq(0)';
    const sessionMaterials = `${sessionTable} tbody tr`;
    const firstSessionLmTitle = `${sessionMaterials}:eq(0) td:eq(0)`;
    const filter = '.filter-session-lms input';

    assert.equal(this.$(sessionMaterials).length, 3);
    this.$(filter).val('file');
    this.$(filter).trigger('input');
    assert.equal(this.$(sessionMaterials).length, 1);
    assert.equal(this.$(firstSessionLmTitle).text().trim(), 'title2');

    return settled();

  });

  test('filter by author', async function(assert) {
    assert.expect(3);
    let course = setupSessionLms();

    this.set('sortBy', 'firstOfferingDate');
    this.set('nothing', ()=>{});
    this.set('course', course);

    await render(hbs`{{course-materials setSortBy=(action nothing) sortBy=sortBy course=course}}`);

    const sessionTable = 'table:eq(0)';
    const sessionMaterials = `${sessionTable} tbody tr`;
    const firstSessionLmTitle = `${sessionMaterials}:eq(0) td:eq(0)`;
    const filter = '.filter-session-lms input';

    assert.equal(this.$(sessionMaterials).length, 3);
    this.$(filter).val('author2');
    this.$(filter).trigger('input');
    assert.equal(this.$(sessionMaterials).length, 1);
    assert.equal(this.$(firstSessionLmTitle).text().trim(), 'title2');

    return settled();

  });

  test('filter by citation', async function(assert) {
    assert.expect(3);
    let course = setupSessionLms();

    this.set('sortBy', 'firstOfferingDate');
    this.set('nothing', ()=>{});
    this.set('course', course);

    await render(hbs`{{course-materials setSortBy=(action nothing) sortBy=sortBy course=course}}`);

    const sessionTable = 'table:eq(0)';
    const sessionMaterials = `${sessionTable} tbody tr`;
    const firstSessionLmTitle = `${sessionMaterials}:eq(0) td:eq(0)`;
    const filter = '.filter-session-lms input';

    assert.equal(this.$(sessionMaterials).length, 3);
    this.$(filter).val('citationtext');
    this.$(filter).trigger('input');
    assert.equal(this.$(sessionMaterials).length, 1);
    assert.equal(this.$(firstSessionLmTitle).text().replace(/[\t\n\s]+/g, ""), 'title3citationtext');

    return settled();

  });
});