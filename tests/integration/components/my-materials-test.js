import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import initializer from "ilios/instance-initializers/load-common-translations";

const { getOwner, Object:EmberObject } = Ember;

moduleForComponent('my-materials', 'Integration | Component | my materials', {
  integration: true,
  setup(){
    initializer.initialize(getOwner(this));
  },
});


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

test('it renders empty', function(assert) {
  this.set('materials', []);
  this.set('nothing', parseInt);
  this.render(hbs`{{my-materials
    materials=materials
    setCourseIdFilter=(action nothing)
    setFilter=(action nothing)
  }}`);

  assert.equal(this.$().text().trim(), 'None');
});

test('it renders with materials', function(assert) {
  assert.expect(43);
  this.set('materials', createMaterials());
  this.set('nothing', parseInt);
  this.render(hbs`{{my-materials
    materials=materials
    sortBy='firstOfferingDate'
    setCourseIdFilter=(action nothing)
    setFilter=(action nothing)
  }}`);

  const table = 'table:eq(0)';
  const materials = `${table} tbody tr`;

  const firstLmTitle = `${materials}:eq(0) td:eq(2)`;
  const firstLmLink = `${firstLmTitle} a:eq(0)`;
  const firstLmTypeIcon = `${firstLmTitle} i.fa-file-pdf-o`;
  const firstLmCourseTitle = `${materials}:eq(0) td:eq(1)`;
  const firstLmSessionTitle = `${materials}:eq(0) td:eq(0)`;
  const firstLmInstructor = `${materials}:eq(0) td:eq(3)`;
  const firstLmFirstOffering = `${materials}:eq(0) td:eq(4)`;
  const firstLmDownloadLink = `${firstLmTitle} a:eq(1)`;

  const secondLmTitle = `${materials}:eq(1) td:eq(2)`;
  const secondLmLink = `${secondLmTitle} a`;
  const secondLmTypeIcon = `${secondLmTitle} i.fa-link`;

  const secondLmCourseTitle = `${materials}:eq(1) td:eq(1)`;
  const secondLmSessionTitle = `${materials}:eq(1) td:eq(0)`;
  const secondLmInstructor = `${materials}:eq(1) td:eq(3)`;
  const secondLmFirstOffering = `${materials}:eq(1) td:eq(4)`;

  const thirdLmTitle = `${materials}:eq(2) td:eq(2)`;
  const thirdLmLink = `${thirdLmTitle} a`;
  const thirdLmTypeIcon = `${thirdLmTitle} i.fa-paragraph`;
  const thirdLmCourseTitle = `${materials}:eq(2) td:eq(1)`;
  const thirdLmSessionTitle = `${materials}:eq(2) td:eq(0)`;
  const thirdLmInstructor = `${materials}:eq(2) td:eq(3)`;
  const thirdLmFirstOffering = `${materials}:eq(2) td:eq(4)`;

  const fourthLmTitle = `${materials}:eq(3) td:eq(2)`;
  const fourthLmLink = `${fourthLmTitle} a`;
  const fourthLmTypeIcon = `${fourthLmTitle} i.fa-file`;
  const fourthLmCourseTitle = `${materials}:eq(3) td:eq(1)`;
  const fourthLmSessionTitle = `${materials}:eq(3) td:eq(0)`;
  const fourthLmInstructor = `${materials}:eq(3) td:eq(3)`;
  const fourthLmFirstOffering = `${materials}:eq(3) td:eq(4)`;

  const fifthLmTitle = `${materials}:eq(4) td:eq(2)`;
  const fifthLmTypeIcon = `${fifthLmTitle} i.fa-clock-o`;
  const fifthLmTimedReleaseInfo = `${fifthLmTitle} .timed-release-info`;
  const fifthLmCourseTitle = `${materials}:eq(4) td:eq(1)`;
  const fifthLmSessionTitle = `${materials}:eq(4) td:eq(0)`;
  const fifthLmInstructor = `${materials}:eq(4) td:eq(3)`;
  const fifthLmFirstOffering = `${materials}:eq(4) td:eq(4)`;

  const courseListOptions = '.course-filter option';
  const allCourses = `${courseListOptions}:eq(0)`;
  const firstCourse = `${courseListOptions}:eq(1)`;
  const secondCourse = `${courseListOptions}:eq(2)`;
  const thirdCourse = `${courseListOptions}:eq(3)`;
  const fourthCourse = `${courseListOptions}:eq(4)`;
  const fifthCourse = `${courseListOptions}:eq(5)`;

  assert.equal(this.$(firstLmTitle).text().trim(), 'title1');
  assert.equal(this.$(firstLmLink).prop('href').trim(), 'http://myhost.com/url1?inline');
  assert.equal(this.$(firstLmTypeIcon).length, 1, 'LM type icon is present.');
  assert.equal(this.$(firstLmSessionTitle).text().trim(), 'session1title');
  assert.equal(this.$(firstLmCourseTitle).text().trim(), 'course1title');
  assert.equal(this.$(firstLmInstructor).text().trim(), 'Instructor1name, Instructor2name');
  assert.equal(this.$(firstLmFirstOffering).text().trim(), '02/02/2003');
  assert.equal(this.$(firstLmDownloadLink).prop('href').trim(), 'http://myhost.com/url1');


  assert.equal(this.$(secondLmTitle).text().trim(), 'title2');
  assert.equal(this.$(secondLmLink).prop('href').trim(), 'http://myhost.com/url2');
  assert.equal(this.$(secondLmTypeIcon).length, 1, 'LM type icon is present.');
  assert.equal(this.$(secondLmSessionTitle).text().trim(), 'session2title');
  assert.equal(this.$(secondLmCourseTitle).text().trim(), 'course2title');
  assert.equal(this.$(secondLmInstructor).text().trim(), 'Instructor1name, Instructor2name');
  assert.equal(this.$(secondLmFirstOffering).text().trim(), '02/02/2016');

  assert.equal(this.$(thirdLmTitle).text().replace(/[\t\n\s]+/g, ""), 'title3citationtext');
  assert.equal(this.$(thirdLmLink).length, 0);
  assert.equal(this.$(thirdLmTypeIcon).length, 1, 'LM type icon is present.');
  assert.equal(this.$(thirdLmSessionTitle).text().trim(), 'session3title');
  assert.equal(this.$(thirdLmCourseTitle).text().trim(), 'course3title');
  assert.equal(this.$(thirdLmInstructor).text().trim(), '');
  assert.equal(this.$(thirdLmFirstOffering).text().trim(), '02/02/2020');

  assert.equal(this.$(fourthLmTitle).text().trim(), 'title4');
  assert.equal(this.$(fourthLmLink).prop('href').trim(), 'http://myhost.com/document.txt');
  assert.equal(this.$(fourthLmTypeIcon).length, 1, 'LM type icon is present.');
  assert.equal(this.$(fourthLmSessionTitle).text().trim(), 'session4title');
  assert.equal(this.$(fourthLmCourseTitle).text().trim(), 'course4title');
  assert.equal(this.$(fourthLmInstructor).text().trim(), 'Instructor3name, Instructor4name');
  assert.equal(this.$(fourthLmFirstOffering).text().trim(), '02/02/2030');

  assert.ok(this.$(fifthLmTitle).text().includes('title5'));
  assert.ok(this.$(fifthLmTimedReleaseInfo).text().includes('Available before 01/03/2013 1:10'));
  assert.equal(this.$(fifthLmTypeIcon).length, 1, 'LM type icon is present.');
  assert.equal(this.$(fifthLmSessionTitle).text().trim(), 'session5title');
  assert.equal(this.$(fifthLmCourseTitle).text().trim(), 'course5title');
  assert.equal(this.$(fifthLmInstructor).text().trim(), '');
  assert.equal(this.$(fifthLmFirstOffering).text().trim(), '02/02/2040');

  assert.equal(this.$(courseListOptions).length, 6);
  assert.equal(this.$(allCourses).text().trim(), 'All Courses');
  assert.equal(this.$(firstCourse).text().trim(), 'course1title');
  assert.equal(this.$(secondCourse).text().trim(), 'course2title');
  assert.equal(this.$(thirdCourse).text().trim(), 'course3title');
  assert.equal(this.$(fourthCourse).text().trim(), 'course4title');
  assert.equal(this.$(fifthCourse).text().trim(), 'course5title');
});

test('filter by title', function(assert) {
  this.set('materials', createMaterials());
  this.set('nothing', parseInt);
  this.set('filter', null);
  this.render(hbs`{{my-materials
    materials=materials
    sortBy='firstOfferingDate'
    setCourseIdFilter=(action nothing)
    setFilter=(action nothing)
    filter=filter
  }}`);

  const table = 'table:eq(0)';
  const materials = `${table} tbody tr`;
  const firstLmTitle = `${materials}:eq(0) td:eq(2)`;

  assert.equal(this.$(materials).length, 5);
  assert.equal(this.$(firstLmTitle).text().trim(), 'title1');

  this.set('filter', 'title2');

  assert.equal(this.$(materials).length, 1);
  assert.equal(this.$(firstLmTitle).text().trim(), 'title2');
});

test('filter by instructor', function(assert) {
  this.set('materials', createMaterials());
  this.set('nothing', parseInt);
  this.set('filter', null);
  this.render(hbs`{{my-materials
    materials=materials
    sortBy='firstOfferingDate'
    setCourseIdFilter=(action nothing)
    setFilter=(action nothing)
    filter=filter
  }}`);

  const table = 'table:eq(0)';
  const materials = `${table} tbody tr`;
  const firstLmTitle = `${materials}:eq(0) td:eq(2)`;
  const secondLmTitle = `${materials}:eq(1) td:eq(2)`;

  assert.equal(this.$(materials).length, 5);
  assert.equal(this.$(firstLmTitle).text().trim(), 'title1');

  this.set('filter', 'instructor1name');

  assert.equal(this.$(materials).length, 2);
  assert.equal(this.$(firstLmTitle).text().trim(), 'title1');
  assert.equal(this.$(secondLmTitle).text().trim(), 'title2');
});

test('filter by session title', function(assert) {
  this.set('materials', createMaterials());
  this.set('nothing', parseInt);
  this.set('filter', null);
  this.render(hbs`{{my-materials
    materials=materials
    sortBy='firstOfferingDate'
    setCourseIdFilter=(action nothing)
    setFilter=(action nothing)
    filter=filter
  }}`);

  const table = 'table:eq(0)';
  const materials = `${table} tbody tr`;
  const firstLmTitle = `${materials}:eq(0) td:eq(2)`;

  assert.equal(this.$(materials).length, 5);
  assert.equal(this.$(firstLmTitle).text().trim(), 'title1');

  this.set('filter', 'session2');

  assert.equal(this.$(materials).length, 1);
  assert.equal(this.$(firstLmTitle).text().trim(), 'title2');
});

test('filter by course title', function(assert) {
  this.set('materials', createMaterials());
  this.set('nothing', parseInt);
  this.set('filter', null);
  this.render(hbs`{{my-materials
    materials=materials
    sortBy='firstOfferingDate'
    setCourseIdFilter=(action nothing)
    setFilter=(action nothing)
    filter=filter
  }}`);

  const table = 'table:eq(0)';
  const materials = `${table} tbody tr`;
  const firstLmTitle = `${materials}:eq(0) td:eq(2)`;

  assert.equal(this.$(materials).length, 5);
  assert.equal(this.$(firstLmTitle).text().trim(), 'title1');

  this.set('filter', 'course2');

  assert.equal(this.$(materials).length, 1);
  assert.equal(this.$(firstLmTitle).text().trim(), 'title2');
});

test('filter by course', function(assert) {
  this.set('materials', createMaterials());
  this.set('nothing', parseInt);
  this.set('courseIdFilter', null);
  this.render(hbs`{{my-materials
    materials=materials
    sortBy='firstOfferingDate'
    setCourseIdFilter=(action nothing)
    setFilter=(action nothing)
    courseIdFilter=courseIdFilter
  }}`);

  const table = 'table:eq(0)';
  const materials = `${table} tbody tr`;
  const firstLmTitle = `${materials}:eq(0) td:eq(2)`;

  assert.equal(this.$(materials).length, 5);
  assert.equal(this.$(firstLmTitle).text().trim(), 'title1');

  this.set('courseIdFilter', '2');

  assert.equal(this.$(materials).length, 1);
  assert.equal(this.$(firstLmTitle).text().trim(), 'title2');
});

test('clicking sort fires action', function(assert) {
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

  this.render(hbs`{{my-materials
    materials=materials
    setCourseIdFilter=(action nothing)
    setFilter=(action nothing)
    setSortBy=(action setSortBy)
    sortBy=sortBy
  }}`);

  const table = 'table:eq(0)';
  const headers = `${table} thead th`;
  const title = `${headers}:eq(2)`;
  const courseTitle = `${headers}:eq(1)`;
  const sessionTitle = `${headers}:eq(0)`;
  const firstOffering = `${headers}:eq(4)`;

  this.$(title).click();
  this.$(title).click();
  this.$(courseTitle).click();
  this.$(courseTitle).click();
  this.$(sessionTitle).click();
  this.$(sessionTitle).click();
  this.$(firstOffering).click();
  this.$(firstOffering).click();

});

test('choosing course fires action', function(assert) {
  assert.expect(3);

  this.set('materials', createMaterials());
  this.set('nothing', parseInt);

  let count = 0;
  let courses = ['1', '3', 'null'];
  this.set('setCourseIdFilter', (what) => {
    assert.equal(what, courses[count]);
    this.set('courseIdFilter', what);

    count++;
  });

  this.set('courseIdFilter', null);

  this.render(hbs`{{my-materials
    materials=materials
    sortBy='firstOfferingDate'
    setFilter=(action nothing)
    setCourseIdFilter=(action setCourseIdFilter)
    courseIdFilter=courseIdFilter
  }}`);

  const select = '.course-filter select';
  const options = `${select} option`;
  const allCourses = `${options}:eq(0)`;
  const firstCourse = `${options}:eq(1)`;
  const thirdCourse = `${options}:eq(3)`;

  this.$(firstCourse).prop('selected', true).change();
  this.$(thirdCourse).prop('selected', true).change();
  this.$(allCourses).prop('selected', true).change();

});

test('find with slash does not blow up on regex error', function(assert) {
  this.set('materials', createMaterials());
  this.set('nothing', parseInt);
  this.set('filter', null);
  this.render(hbs`{{my-materials
    materials=materials
    sortBy='firstOfferingDate'
    setCourseIdFilter=(action nothing)
    setFilter=(action nothing)
    filter=filter
  }}`);

  const table = 'table:eq(0)';
  const materials = `${table} tbody tr`;
  const firstLmTitle = `${materials}:eq(0) td:eq(2)`;

  assert.equal(this.$(materials).length, 5);
  assert.equal(this.$(firstLmTitle).text().trim(), 'title1');

  this.set('filter', "course2\\");

  assert.equal(this.$(materials).length, 0);
});
