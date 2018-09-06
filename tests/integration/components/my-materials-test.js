import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render, findAll, find, fillIn } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';


module('Integration | Component | my materials', function(hooks) {
  setupRenderingTest(hooks);

  let createMaterials = function(){
    let lm1 = EmberObject.create({
      title: 'title1',
      absoluteFileUri: 'http://myhost.com/url1',
      sessionTitle: 'session1title',
      course: '1',
      courseTitle: 'course1title',
      instructors: ['Instructor1name', 'Instructor2name'],
      firstOfferingDate: new Date(2003, 1, 2, 12),
      type: 'file',
      mimetype: 'application/pdf'
    });
    let lm2 = EmberObject.create({
      title: 'title2',
      link: 'http://myhost.com/url2',
      sessionTitle: 'session2title',
      course: '2',
      courseTitle: 'course2title',
      instructors: ['Instructor1name', 'Instructor2name'],
      firstOfferingDate: new Date(2016, 1, 2, 12),
      type: 'link',
    });
    let lm3 = EmberObject.create({
      title: 'title3',
      citation: 'citationtext',
      sessionTitle: 'session3title',
      course: '3',
      courseTitle: 'course3title',
      firstOfferingDate: new Date(2020, 1, 2, 12),
      type: 'citation'
    });
    let lm4 = EmberObject.create({
      title: 'title4',
      absoluteFileUri: 'http://myhost.com/document.txt',
      sessionTitle: 'session4title',
      course: '4',
      courseTitle: 'course4title',
      instructors: ['Instructor3name', 'Instructor4name'],
      firstOfferingDate: new Date(2030, 1, 2, 12),
      type: 'file',
      mimetype: 'plain/text'
    });
    let lm5 = EmberObject.create({
      title: 'title5',
      sessionTitle: 'session5title',
      course: '5',
      courseTitle: 'course5title',
      firstOfferingDate: new Date(2040, 1, 2, 12),
      isBlanked: true,
      endDate: new Date('2013-03-01T01:10:00')
    });

    return [lm1, lm2, lm3, lm4, lm5];
  };

  test('it renders empty', async function(assert) {
    this.set('materials', []);
    this.set('nothing', parseInt);
    await render(hbs`{{my-materials
      materials=materials
      setCourseIdFilter=(action nothing)
      setFilter=(action nothing)
    }}`);

    assert.equal(this.element.textContent.trim(), 'None');
  });

  test('it renders with materials', async function(assert) {
    assert.expect(42);
    this.set('materials', createMaterials());
    this.set('nothing', parseInt);
    await render(hbs`{{my-materials
      materials=materials
      sortBy='firstOfferingDate'
      setCourseIdFilter=(action nothing)
      setFilter=(action nothing)
    }}`);

    const table = 'table:nth-of-type(1)';
    const materials = `${table} tbody tr`;

    const firstLmTitle = `${materials}:nth-of-type(1) td:nth-of-type(3)`;
    const firstLmLink = `${firstLmTitle} a:nth-of-type(1)`;
    const firstLmTypeIcon = `${firstLmTitle} .fa-file-pdf`;
    const firstLmCourseTitle = `${materials}:nth-of-type(1) td:nth-of-type(2)`;
    const firstLmSessionTitle = `${materials}:nth-of-type(1) td:nth-of-type(1)`;
    const firstLmInstructor = `${materials}:nth-of-type(1) td:nth-of-type(4)`;
    const firstLmFirstOffering = `${materials}:nth-of-type(1) td:nth-of-type(5)`;
    const firstLmDownloadLink = `${firstLmTitle} a:nth-of-type(2)`;

    const secondLmTitle = `${materials}:nth-of-type(2) td:nth-of-type(3)`;
    const secondLmLink = `${secondLmTitle} a`;
    const secondLmTypeIcon = `${secondLmTitle} .fa-link`;

    const secondLmCourseTitle = `${materials}:nth-of-type(2) td:nth-of-type(2)`;
    const secondLmSessionTitle = `${materials}:nth-of-type(2) td:nth-of-type(1)`;
    const secondLmInstructor = `${materials}:nth-of-type(2) td:nth-of-type(4)`;
    const secondLmFirstOffering = `${materials}:nth-of-type(2) td:nth-of-type(5)`;

    const thirdLmTitle = `${materials}:nth-of-type(3) td:nth-of-type(3)`;
    const thirdLmLink = `${thirdLmTitle} a`;
    const thirdLmTypeIcon = `${thirdLmTitle} .fa-paragraph`;
    const thirdLmCourseTitle = `${materials}:nth-of-type(3) td:nth-of-type(2)`;
    const thirdLmSessionTitle = `${materials}:nth-of-type(3) td:nth-of-type(1)`;
    const thirdLmInstructor = `${materials}:nth-of-type(3) td:nth-of-type(4)`;
    const thirdLmFirstOffering = `${materials}:nth-of-type(3) td:nth-of-type(5)`;

    const fourthLmTitle = `${materials}:nth-of-type(4) td:nth-of-type(3)`;
    const fourthLmLink = `${fourthLmTitle} a`;
    const fourthLmTypeIcon = `${fourthLmTitle} .fa-file`;
    const fourthLmCourseTitle = `${materials}:nth-of-type(4) td:nth-of-type(2)`;
    const fourthLmSessionTitle = `${materials}:nth-of-type(4) td:nth-of-type(1)`;
    const fourthLmInstructor = `${materials}:nth-of-type(4) td:nth-of-type(4)`;
    const fourthLmFirstOffering = `${materials}:nth-of-type(4) td:nth-of-type(5)`;

    const fifthLmTitle = `${materials}:nth-of-type(5) td:nth-of-type(3)`;
    const fifthLmTypeIcon = `${fifthLmTitle} .fa-clock`;
    const fifthLmCourseTitle = `${materials}:nth-of-type(5) td:nth-of-type(2)`;
    const fifthLmSessionTitle = `${materials}:nth-of-type(5) td:nth-of-type(1)`;
    const fifthLmInstructor = `${materials}:nth-of-type(5) td:nth-of-type(4)`;
    const fifthLmFirstOffering = `${materials}:nth-of-type(5) td:nth-of-type(5)`;

    const courseListOptions = '.course-filter option';
    const allCourses = `${courseListOptions}:nth-of-type(1)`;
    const firstCourse = `${courseListOptions}:nth-of-type(2)`;
    const secondCourse = `${courseListOptions}:nth-of-type(3)`;
    const thirdCourse = `${courseListOptions}:nth-of-type(4)`;
    const fourthCourse = `${courseListOptions}:nth-of-type(5)`;
    const fifthCourse = `${courseListOptions}:nth-of-type(6)`;

    assert.equal(find(firstLmTitle).textContent.trim(), 'title1');
    assert.equal(find(firstLmLink).getAttribute('href').trim(), 'http://myhost.com/url1?inline');
    assert.equal(findAll(firstLmTypeIcon).length, 1, 'LM type icon is present.');
    assert.equal(find(firstLmSessionTitle).textContent.trim(), 'session1title');
    assert.equal(find(firstLmCourseTitle).textContent.trim(), 'course1title');
    assert.equal(find(firstLmInstructor).textContent.trim(), 'Instructor1name, Instructor2name');
    assert.equal(find(firstLmFirstOffering).textContent.trim(), '02/02/2003');
    assert.equal(find(firstLmDownloadLink).getAttribute('href').trim(), 'http://myhost.com/url1');


    assert.equal(find(secondLmTitle).textContent.trim(), 'title2');
    assert.equal(find(secondLmLink).getAttribute('href').trim(), 'http://myhost.com/url2');
    assert.equal(findAll(secondLmTypeIcon).length, 1, 'LM type icon is present.');
    assert.equal(find(secondLmSessionTitle).textContent.trim(), 'session2title');
    assert.equal(find(secondLmCourseTitle).textContent.trim(), 'course2title');
    assert.equal(find(secondLmInstructor).textContent.trim(), 'Instructor1name, Instructor2name');
    assert.equal(find(secondLmFirstOffering).textContent.trim(), '02/02/2016');

    assert.equal(find(thirdLmTitle).textContent.replace(/[\t\n\s]+/g, ""), 'title3citationtext');
    assert.equal(findAll(thirdLmLink).length, 0);
    assert.equal(findAll(thirdLmTypeIcon).length, 1, 'LM type icon is present.');
    assert.equal(find(thirdLmSessionTitle).textContent.trim(), 'session3title');
    assert.equal(find(thirdLmCourseTitle).textContent.trim(), 'course3title');
    assert.equal(find(thirdLmInstructor).textContent.trim(), '');
    assert.equal(find(thirdLmFirstOffering).textContent.trim(), '02/02/2020');

    assert.equal(find(fourthLmTitle).textContent.trim(), 'title4');
    assert.equal(find(fourthLmLink).getAttribute('href').trim(), 'http://myhost.com/document.txt');
    assert.equal(findAll(fourthLmTypeIcon).length, 1, 'LM type icon is present.');
    assert.equal(find(fourthLmSessionTitle).textContent.trim(), 'session4title');
    assert.equal(find(fourthLmCourseTitle).textContent.trim(), 'course4title');
    assert.equal(find(fourthLmInstructor).textContent.trim(), 'Instructor3name, Instructor4name');
    assert.equal(find(fourthLmFirstOffering).textContent.trim(), '02/02/2030');

    assert.ok(find(fifthLmTitle).textContent.includes('title5'));
    assert.equal(findAll(fifthLmTypeIcon).length, 1, 'LM type icon is present.');
    assert.equal(find(fifthLmSessionTitle).textContent.trim(), 'session5title');
    assert.equal(find(fifthLmCourseTitle).textContent.trim(), 'course5title');
    assert.equal(find(fifthLmInstructor).textContent.trim(), '');
    assert.equal(find(fifthLmFirstOffering).textContent.trim(), '02/02/2040');

    assert.equal(findAll(courseListOptions).length, 6);
    assert.equal(find(allCourses).textContent.trim(), 'All Courses');
    assert.equal(find(firstCourse).textContent.trim(), 'course1title');
    assert.equal(find(secondCourse).textContent.trim(), 'course2title');
    assert.equal(find(thirdCourse).textContent.trim(), 'course3title');
    assert.equal(find(fourthCourse).textContent.trim(), 'course4title');
    assert.equal(find(fifthCourse).textContent.trim(), 'course5title');
  });

  test('filter by title', async function(assert) {
    this.set('materials', createMaterials());
    this.set('nothing', parseInt);
    this.set('filter', null);
    await render(hbs`{{my-materials
      materials=materials
      sortBy='firstOfferingDate'
      setCourseIdFilter=(action nothing)
      setFilter=(action nothing)
      filter=filter
    }}`);

    const table = 'table:nth-of-type(1)';
    const materials = `${table} tbody tr`;
    const firstLmTitle = `${materials}:nth-of-type(1) td:nth-of-type(3)`;

    assert.equal(findAll(materials).length, 5);
    assert.equal(find(firstLmTitle).textContent.trim(), 'title1');

    this.set('filter', 'title2');

    assert.equal(findAll(materials).length, 1);
    assert.equal(find(firstLmTitle).textContent.trim(), 'title2');
  });

  test('filter by instructor', async function(assert) {
    this.set('materials', createMaterials());
    this.set('nothing', parseInt);
    this.set('filter', null);
    await render(hbs`{{my-materials
      materials=materials
      sortBy='firstOfferingDate'
      setCourseIdFilter=(action nothing)
      setFilter=(action nothing)
      filter=filter
    }}`);

    const table = 'table:nth-of-type(1)';
    const materials = `${table} tbody tr`;
    const firstLmTitle = `${materials}:nth-of-type(1) td:nth-of-type(3)`;
    const secondLmTitle = `${materials}:nth-of-type(2) td:nth-of-type(3)`;

    assert.equal(findAll(materials).length, 5);
    assert.equal(find(firstLmTitle).textContent.trim(), 'title1');

    this.set('filter', 'instructor1name');

    assert.equal(findAll(materials).length, 2);
    assert.equal(find(firstLmTitle).textContent.trim(), 'title1');
    assert.equal(find(secondLmTitle).textContent.trim(), 'title2');
  });

  test('filter by session title', async function(assert) {
    this.set('materials', createMaterials());
    this.set('nothing', parseInt);
    this.set('filter', null);
    await render(hbs`{{my-materials
      materials=materials
      sortBy='firstOfferingDate'
      setCourseIdFilter=(action nothing)
      setFilter=(action nothing)
      filter=filter
    }}`);

    const table = 'table:nth-of-type(1)';
    const materials = `${table} tbody tr`;
    const firstLmTitle = `${materials}:nth-of-type(1) td:nth-of-type(3)`;

    assert.equal(findAll(materials).length, 5);
    assert.equal(find(firstLmTitle).textContent.trim(), 'title1');

    this.set('filter', 'session2');

    assert.equal(findAll(materials).length, 1);
    assert.equal(find(firstLmTitle).textContent.trim(), 'title2');
  });

  test('filter by course title', async function(assert) {
    this.set('materials', createMaterials());
    this.set('nothing', parseInt);
    this.set('filter', null);
    await render(hbs`{{my-materials
      materials=materials
      sortBy='firstOfferingDate'
      setCourseIdFilter=(action nothing)
      setFilter=(action nothing)
      filter=filter
    }}`);

    const table = 'table:nth-of-type(1)';
    const materials = `${table} tbody tr`;
    const firstLmTitle = `${materials}:nth-of-type(1) td:nth-of-type(3)`;

    assert.equal(findAll(materials).length, 5);
    assert.equal(find(firstLmTitle).textContent.trim(), 'title1');

    this.set('filter', 'course2');

    assert.equal(findAll(materials).length, 1);
    assert.equal(find(firstLmTitle).textContent.trim(), 'title2');
  });

  test('filter by course', async function(assert) {
    this.set('materials', createMaterials());
    this.set('nothing', parseInt);
    this.set('courseIdFilter', null);
    await render(hbs`{{my-materials
      materials=materials
      sortBy='firstOfferingDate'
      setCourseIdFilter=(action nothing)
      setFilter=(action nothing)
      courseIdFilter=courseIdFilter
    }}`);

    const table = 'table:nth-of-type(1)';
    const materials = `${table} tbody tr`;
    const firstLmTitle = `${materials}:nth-of-type(1) td:nth-of-type(3)`;

    assert.equal(findAll(materials).length, 5);
    assert.equal(find(firstLmTitle).textContent.trim(), 'title1');

    this.set('courseIdFilter', '2');

    assert.equal(findAll(materials).length, 1);
    assert.equal(find(firstLmTitle).textContent.trim(), 'title2');
  });

  test('clicking sort fires action', async function(assert) {
    assert.expect(8);

    this.set('materials', createMaterials());
    this.set('nothing', parseInt);

    let count = 0;
    let sortBys = ['title', 'title:desc', 'courseTitle', 'courseTitle:desc', 'sessionTitle', 'sessionTitle:desc', 'firstOfferingDate', 'firstOfferingDate:desc'];
    this.set('setSortBy', (what) => {
      assert.equal(what, sortBys[count]);
      this.set('sortBy', what);

      count++;
    });

    this.set('sortBy', 'firstOfferingDate');

    await render(hbs`{{my-materials
      materials=materials
      setCourseIdFilter=(action nothing)
      setFilter=(action nothing)
      setSortBy=(action setSortBy)
      sortBy=sortBy
    }}`);

    const table = 'table:nth-of-type(1)';
    const headers = `${table} thead th`;
    const title = `${headers}:nth-of-type(3)`;
    const courseTitle = `${headers}:nth-of-type(2)`;
    const sessionTitle = `${headers}:nth-of-type(1)`;
    const firstOffering = `${headers}:nth-of-type(5)`;

    await click(title);
    await click(title);
    await click(courseTitle);
    await click(courseTitle);
    await click(sessionTitle);
    await click(sessionTitle);
    await click(firstOffering);
    await click(firstOffering);

  });

  test('choosing course fires action', async function(assert) {
    assert.expect(3);

    this.set('materials', createMaterials());
    this.set('nothing', parseInt);

    let count = 0;
    let courses = ['1', '3', ''];
    this.set('setCourseIdFilter', (what) => {
      assert.equal(what, courses[count]);
      this.set('courseIdFilter', what);

      count++;
    });

    this.set('courseIdFilter', null);

    await render(hbs`{{my-materials
      materials=materials
      sortBy='firstOfferingDate'
      setFilter=(action nothing)
      setCourseIdFilter=(action setCourseIdFilter)
      courseIdFilter=courseIdFilter
    }}`);

    const select = '.course-filter select';

    await fillIn(select, '1');
    await fillIn(select, '3');
    await fillIn(select, '');
  });

  test('find with slash does not blow up on regex error', async function(assert) {
    this.set('materials', createMaterials());
    this.set('nothing', parseInt);
    this.set('filter', null);
    await render(hbs`{{my-materials
      materials=materials
      sortBy='firstOfferingDate'
      setCourseIdFilter=(action nothing)
      setFilter=(action nothing)
      filter=filter
    }}`);

    const table = 'table:nth-of-type(1)';
    const materials = `${table} tbody tr`;
    const firstLmTitle = `${materials}:nth-of-type(1) td:nth-of-type(3)`;

    assert.equal(findAll(materials).length, 5);
    assert.equal(find(firstLmTitle).textContent.trim(), 'title1');

    this.set('filter', "course2\\");

    assert.equal(findAll(materials).length, 0);
  });
});
