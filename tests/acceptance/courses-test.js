import destroyApp from '../helpers/destroy-app';
import { module, test } from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';
import moment from 'moment';

import Ember from 'ember';

const { run } = Ember;
const { later } = run;

var application;

module('Acceptance: Courses', {
  beforeEach: function() {
    application = startApp();
    setupAuthentication(application);
    server.createList('school', 2);
  },

  afterEach: function() {
    destroyApp(application);
  }
});

test('visiting /courses', function(assert) {
  visit('/courses');
  andThen(function() {
    assert.equal(currentPath(), 'courses');
  });
});

test('filters by title', function(assert) {
  server.create('academicYear', {id: 2014});
  assert.expect(22);
  let firstCourse = server.create('course', {
    title: 'specialfirstcourse',
    year: 2014,
    school: 1,
  });
  let secondCourse = server.create('course', {
    title: 'specialsecondcourse',
    year: 2014,
    school: 1
  });
  let regularCourse = server.create('course', {
    title: 'regularcourse',
    year: 2014,
    school: 1
  });
  let lastCourse = server.create('course', {
    title: 'aaLastcourse',
    year: 2014,
    school: 1
  });
  server.create('course', {
    title: 'archivedCourse',
    year: 2014,
    school: 1,
    archived: true
  });
  visit('/courses');
  andThen(function() {
    assert.equal(4, find('.list tbody tr').length);
    assert.equal(getElementText(find('.list tbody tr:eq(0) td:eq(0)')), getText(lastCourse.title));
    assert.equal(getElementText(find('.list tbody tr:eq(1) td:eq(0)')), getText(regularCourse.title));
    assert.equal(getElementText(find('.list tbody tr:eq(2) td:eq(0)')), getText(firstCourse.title));
    assert.equal(getElementText(find('.list tbody tr:eq(3) td:eq(0)')), getText(secondCourse.title));

    //put these in nested later blocks because there is a 500ms debounce on the title filter
    fillIn('.titlefilter input', 'first');
    later(function(){
      assert.equal(1, find('.list tbody tr').length);
      assert.equal(getElementText(find('.list tbody tr:eq(0) td:eq(0)')), getText(firstCourse.title));
      fillIn('.titlefilter input', 'second');
      andThen(function(){
        later(function(){
          assert.equal(1, find('.list tbody tr').length);
          assert.equal(getElementText(find('.list tbody tr:eq(0) td:eq(0)')), getText(secondCourse.title));
          fillIn('.titlefilter input', 'special');
          andThen(function(){
            later(function(){
              assert.equal(2, find('.list tbody tr').length);
              assert.equal(getElementText(find('.list tbody tr:eq(0) td:eq(0)')), getText(firstCourse.title));
              assert.equal(getElementText(find('.list tbody tr:eq(1) td:eq(0)')), getText(secondCourse.title));

              fillIn('.titlefilter input', 'course');
              andThen(function(){
                later(function(){
                  assert.equal(4, find('.list tbody tr').length);
                  assert.equal(getElementText(find('.list tbody tr:eq(0) td:eq(0)')), getText(lastCourse.title));
                  assert.equal(getElementText(find('.list tbody tr:eq(1) td:eq(0)')), getText(regularCourse.title));
                  assert.equal(getElementText(find('.list tbody tr:eq(2) td:eq(0)')), getText(firstCourse.title));
                  assert.equal(getElementText(find('.list tbody tr:eq(3) td:eq(0)')), getText(secondCourse.title));

                  fillIn('.titlefilter input', '');
                  andThen(function(){
                    later(function(){
                      assert.equal(4, find('.list tbody tr').length);
                      assert.equal(getElementText(find('.list tbody tr:eq(0) td:eq(0)')), getText(lastCourse.title));
                      assert.equal(getElementText(find('.list tbody tr:eq(1) td:eq(0)')), getText(regularCourse.title));
                      assert.equal(getElementText(find('.list tbody tr:eq(2) td:eq(0)')), getText(firstCourse.title));
                      assert.equal(getElementText(find('.list tbody tr:eq(3) td:eq(0)')), getText(secondCourse.title));
                    }, 750);
                  });
                }, 750);
              });
            }, 750);
          });
        }, 750);
      });
    }, 750);
  });
});

test('filters by year', function(assert) {
  server.create('academicYear', {id: 2013});
  server.create('academicYear', {id: 2014});
  assert.expect(4);
  let firstCourse = server.create('course', {
    year: 2013,
    school: 1,
  });
  let secondCourse = server.create('course', {
    year: 2014,
    school: 1
  });
  visit('/courses');
  andThen(function() {
    pickOption('.yearsfilter select', '2013 - 2014', assert);
    andThen(function(){
      assert.equal(getElementText(find('.list tbody tr:eq(0) td:eq(0)')), getText(firstCourse.title));
    });
  });
  andThen(function() {
    pickOption('.yearsfilter select', '2014 - 2015', assert);
    andThen(function(){
      assert.equal(getElementText(find('.list tbody tr:eq(0) td:eq(0)')), getText(secondCourse.title));
    });
  });
});

test('initial filter by year', function(assert) {
  server.create('academicYear', {id: 2013});
  server.create('academicYear', {id: 2014});
  assert.expect(4);
  let firstCourse = server.create('course', {
    year: 2013,
    school: 1,
  });
  let secondCourse = server.create('course', {
    year: 2014,
    school: 1
  });
  visit('/courses?year=2014');
  andThen(function() {
    assert.equal(find('.list tbody tr').length, 1);
    assert.equal(getElementText(find('.list tbody tr:eq(0) td:eq(0)')), getText(secondCourse.title));
  });

  visit('/courses?year=2013');
  andThen(function() {
    assert.equal(find('.list tbody tr').length, 1);
    assert.equal(getElementText(find('.list tbody tr:eq(0) td:eq(0)')), getText(firstCourse.title));
  });
});

test('filters by mycourses', function(assert) {
  server.create('academicYear', {id: 2014});
  assert.expect(5);
  let firstCourse = server.create('course', {
    year: 2014,
    school: 1
  });
  let secondCourse = server.create('course', {
    year: 2014,
    school: 1,
    directors: [4136]
  });
  visit('/courses');
  andThen(function() {
    assert.equal(find('.list tbody tr').length, 2);
    assert.equal(getElementText(find('.list tbody tr:eq(0) td:eq(0)')), getText(firstCourse.title));
    assert.equal(getElementText(find('.list tbody tr:eq(1) td:eq(0)')), getText(secondCourse.title));
    click('.toggle-mycourses label');
    andThen(function(){
      assert.equal(find('.list tbody tr').length, 1);
      assert.equal(getElementText(find('.list tbody tr:eq(0) td:eq(0)')), getText(secondCourse.title));
    });
  });
});

test('filters options', function(assert) {
  assert.expect(8);
  server.createList('school', 2);
  server.create('permission', {
    tableName: 'school',
    tableRowId: 1,
    user: 4136
  });
  server.db.users.update(4136, {permissions: [1], school: 2});

  server.create('academicYear', {id: 2013});
  server.create('academicYear', {id: 2014});

  const yearSelect = '.yearsfilter select';
  const schoolSelect = '.schoolsfilter select';
  const years = `${yearSelect} option`;
  const schools = `${schoolSelect} option`;

  visit('/courses');
  andThen(function() {
    let yearOptions = find(years);
    assert.equal(yearOptions.length, 2);
    assert.equal(getElementText(yearOptions.eq(0)).substring(0,4), 2014);
    assert.equal(getElementText(yearOptions.eq(1)).substring(0,4), 2013);
    assert.equal(find(yearSelect).val(), '2014 - 2015');

    let schoolOptions = find(schools);
    assert.equal(schoolOptions.length, 2);
    assert.equal(getElementText(schoolOptions.eq(0)), 'school0');
    assert.equal(getElementText(schoolOptions.eq(1)), 'school1');
    assert.equal(find(schoolSelect).val(), '2');


  });
});

test('user can only delete non-published courses with proper privileges', function(assert) {
  server.create('academicYear', {id: 2014});
  assert.expect(4);
  server.create('course', {
    year: 2014,
    school: 1,
    published: true,
  });
  server.create('course', {
    year: 2014,
    school: 1,
    published: false,
  });
  server.create('course', {
    year: 2014,
    school: 1,
    published: true,
    directors: [4136],
  });
  server.create('course', {
    year: 2014,
    school: 1,
    published: false,
    directors: [4136]
  });
  const courses = '.list tbody tr';
  const remove = 'td:eq(6) .remove';
  const firstCourseRemove = `${courses}:eq(0) ${remove}`;
  const secondCourseRemove = `${courses}:eq(1) ${remove}`;
  const thirdCourseRemove = `${courses}:eq(2) ${remove}`;
  const fourthCourseRemove = `${courses}:eq(3) ${remove}`;
  visit('/courses');
  andThen(function() {
    assert.equal(find(firstCourseRemove).length, 0, 'non-privileged user cannot delete published course');
    assert.equal(find(secondCourseRemove).length, 0, 'non-privileged user cannot delete unpublished course');
    assert.equal(find(thirdCourseRemove).length, 0, 'privileged user cannot delete published course');
    assert.equal(find(fourthCourseRemove).length, 1, 'privileged user can delete unpublished course');
  });
});

test('new course', function(assert) {
  const year = moment().year();
  server.create('academicYear', {id: year});
  assert.expect(5);

  const url = `/courses?year=${year}`;
  const expandButton = '.expand-button';
  const input = '.new-course input';
  const selectField = '.new-course select';
  const saveButton = '.done';
  const savedLink = '.saved-result a';

  visit(url);
  click(expandButton);
  fillIn(input, 'Course 1');
  pickOption(selectField, `${year} - ${year + 1}`, assert);
  click(saveButton);
  andThen(() => {
    function getContent(i) {
      return find(`tbody tr td:eq(${i})`).text().trim();
    }

    assert.equal(find(savedLink).text().trim(), 'Course 1', 'link is visible');
    assert.equal(getContent(0), 'Course 1', 'course is correct');
    assert.equal(getContent(1), 'school 0', 'school is correct');
    assert.equal(getContent(2), `${year} - ${year + 1}`, 'year is correct');
  });
});

test('new course in another year does not display in list', function(assert) {
  server.create('academicYear', {id: 2012});
  server.create('academicYear', {id: 2013});
  assert.expect(1);
  visit('/courses');
  let newTitle = 'new course title, woohoo';
  andThen(function() {
    let container = find('.courses');
    click('.actions button', container);
    andThen(function(){
      fillIn('.new-course input:eq(0)', newTitle);

      click('.new-course .done', container).then(function(){
        var rows = find('tbody tr', container);
        assert.equal(rows.length, 0);
      });
    });
  });
});

test('new course does not appear twice when navigating back', function(assert) {
  const year = moment().year();
  server.create('academicYear', {id: year});
  assert.expect(5);

  const url = `/courses?year=${year}`;
  const expandButton = '.expand-button';
  const input = '.new-course input';
  const selectField = '.new-course select';
  const saveButton = '.done';
  const savedLink = '.saved-result a';
  const courseTitle = "Course 1";
  const course1InList = `tbody tr:contains("${courseTitle}")`;

  visit(url);
  click(expandButton);
  fillIn(input, courseTitle);
  pickOption(selectField, `${year} - ${year + 1}`, assert);
  click(saveButton);
  andThen(() => {
    assert.equal(find(savedLink).length, 1, 'one copy of the save link');
    assert.equal(find(course1InList).length, 1, 'one copy of the course in the list');
  });
  click(savedLink);
  visit(url);
  andThen(() => {
    assert.equal(find(savedLink).length, 1, 'one copy of the save link');
    assert.equal(find(course1InList).length, 1, 'one copy of the course in the list');
  });
});

test('new course can be deleted', function(assert) {
  const year = moment().year();
  server.create('academicYear', {id: year});
  server.create('userRole', {
    title: 'Developer'
  });
  server.db.users.update(4136, {roles: [1]});

  assert.expect(7);

  const url = `/courses?year=${year}`;
  const expandButton = '.expand-button';
  const input = '.new-course input';
  const selectField = '.new-course select';
  const saveButton = '.done';
  const courses = '.list tbody tr';
  const deleteCourse = `${courses} .remove`;
  const deleteConfirm = `.confirm-buttons .remove`;
  const savedCourse = '.saved-result';

  visit(url);
  andThen(() => {
    assert.equal(find(courses).length, 0, 'there are initiall no courses');
    assert.equal(find(savedCourse).length, 0, 'there are intially no saved courses');
    click(expandButton);
    fillIn(input, 'Course 1');
    pickOption(selectField, `${year} - ${year + 1}`, assert);
    click(saveButton);
    andThen(() => {
      assert.equal(find(courses).length, 1, 'there is one new course');
      assert.equal(find(savedCourse).length, 1, 'there is one new saved course');
      click(deleteCourse);
      click(deleteConfirm);
      andThen(()=>{
        assert.equal(find(courses).length, 0, 'the new course has been deleted');
        assert.equal(find(savedCourse).length, 0, 'the saved course has been deleted');
      });
    });
  });

});

test('locked courses', function(assert) {
  server.create('academicYear', {id: 2014});
  assert.expect(6);
  server.create('course', {
    year: 2014,
    school: 1
  });
  server.create('course', {
    year: 2014,
    school: 1,
    locked: true
  });

  const url = '/courses?year=2014';

  visit(url);
  andThen(() => {
    function getContent(row, column) {
      return find(`tbody tr:eq(${row}) td:eq(${column})`).text().trim();
    }

    assert.equal(getContent(0, 0), 'course 0', 'course name is correct');
    assert.equal(getContent(0, 6), 'Not Published', 'status');
    assert.ok(find(`tbody tr:eq(0) td:eq(6) i.fa-lock`).length === 0);

    assert.equal(getContent(1, 0), 'course 1', 'course name is correct');
    assert.equal(getContent(1, 6), 'Not Published', 'status');
    assert.ok(find(`tbody tr:eq(1) td:eq(6) i.fa-lock`).length === 1);

  });
});

test('no academic years exist', function(assert) {
  assert.expect(6);
  const expandButton = '.expand-button';
  const newAcademicYearsOptions = '.new-course option';
  const url = '/courses';

  visit(url);
  click(expandButton);
  andThen(() => {
    let thisYear = parseInt(moment().format('YYYY'));
    let years = [
      thisYear-2,
      thisYear-1,
      thisYear,
      thisYear+1,
      thisYear+2
    ];

    var yearOptions = find(newAcademicYearsOptions);
    assert.equal(yearOptions.length, years.length);
    for (let i = 0; i < years.length; i++){
      assert.equal(getElementText(yearOptions.eq(i)).substring(0,4), years[i]);
    }
  });
});

test('sort by title', function(assert) {
  const firstCourseTitle = '.list tbody tr:eq(0) td:eq(0)';
  const secondCourseTitle = '.list tbody tr:eq(1) td:eq(0)';
  server.create('academicYear', {id: 2014});
  assert.expect(4);
  let firstCourse = server.create('course', {
    year: 2014,
    school: 1
  });
  let secondCourse = server.create('course', {
    year: 2014,
    school: 1,
  });
  visit('/courses');
  andThen(function() {
    assert.equal(getElementText(find(firstCourseTitle)), getText(firstCourse.title));
    assert.equal(getElementText(find(secondCourseTitle)), getText(secondCourse.title));
    click('th:eq(0)').then(()=>{
      assert.equal(getElementText(find(firstCourseTitle)), getText(secondCourse.title));
      assert.equal(getElementText(find(secondCourseTitle)), getText(firstCourse.title));
    });
  });
});

test('sort by level', function(assert) {
  const firstCourseTitle = '.list tbody tr:eq(0) td:eq(0)';
  const secondCourseTitle = '.list tbody tr:eq(1) td:eq(0)';
  const sortingHeader = 'th:eq(3)';
  server.create('academicYear', {id: 2014});
  assert.expect(4);
  let firstCourse = server.create('course', {
    year: 2014,
    school: 1,
    level: 1
  });
  let secondCourse = server.create('course', {
    year: 2014,
    school: 1,
    level: 2
  });
  visit('/courses');
  click(sortingHeader);
  andThen(function() {
    assert.equal(getElementText(find(firstCourseTitle)), getText(firstCourse.title));
    assert.equal(getElementText(find(secondCourseTitle)), getText(secondCourse.title));
    click(sortingHeader).then(()=>{
      assert.equal(getElementText(find(firstCourseTitle)), getText(secondCourse.title));
      assert.equal(getElementText(find(secondCourseTitle)), getText(firstCourse.title));
    });
  });
});

test('sort by startDate', function(assert) {
  const firstCourseTitle = '.list tbody tr:eq(0) td:eq(0)';
  const secondCourseTitle = '.list tbody tr:eq(1) td:eq(0)';
  const sortingHeader = 'th:eq(4)';
  server.create('academicYear', {id: 2014});
  assert.expect(4);
  let firstCourse = server.create('course', {
    year: 2014,
    school: 1,
    startDate: moment().toDate()
  });
  let secondCourse = server.create('course', {
    year: 2014,
    school: 1,
    startDate: moment().add(1, 'day').toDate()
  });
  visit('/courses');
  click(sortingHeader);
  andThen(function() {
    assert.equal(getElementText(find(firstCourseTitle)), getText(firstCourse.title));
    assert.equal(getElementText(find(secondCourseTitle)), getText(secondCourse.title));
    click(sortingHeader).then(()=>{
      assert.equal(getElementText(find(firstCourseTitle)), getText(secondCourse.title));
      assert.equal(getElementText(find(secondCourseTitle)), getText(firstCourse.title));
    });
  });
});

test('sort by endDate', function(assert) {
  const firstCourseTitle = '.list tbody tr:eq(0) td:eq(0)';
  const secondCourseTitle = '.list tbody tr:eq(1) td:eq(0)';
  const sortingHeader = 'th:eq(5)';
  server.create('academicYear', {id: 2014});
  assert.expect(4);
  let firstCourse = server.create('course', {
    year: 2014,
    school: 1,
    endDate: moment().toDate()
  });
  let secondCourse = server.create('course', {
    year: 2014,
    school: 1,
    endDate: moment().add(1, 'day').toDate()
  });
  visit('/courses');
  click(sortingHeader);
  andThen(function() {
    assert.equal(getElementText(find(firstCourseTitle)), getText(firstCourse.title));
    assert.equal(getElementText(find(secondCourseTitle)), getText(secondCourse.title));
    click(sortingHeader).then(()=>{
      assert.equal(getElementText(find(firstCourseTitle)), getText(secondCourse.title));
      assert.equal(getElementText(find(secondCourseTitle)), getText(firstCourse.title));
    });
  });
});

test('sort by status', function(assert) {
  const firstCourseTitle = '.list tbody tr:eq(0) td:eq(0)';
  const secondCourseTitle = '.list tbody tr:eq(1) td:eq(0)';
  const thirdCourseTitle = '.list tbody tr:eq(2) td:eq(0)';
  const sortingHeader = 'th:eq(6)';
  server.create('academicYear', {id: 2014});
  assert.expect(6);
  let firstCourse = server.create('course', {
    year: 2014,
    school: 1,
    published: true,
    publishedAsTbd: false
  });
  let secondCourse = server.create('course', {
    year: 2014,
    school: 1,
    published: true,
    publishedAsTbd: true
  });
  let thirdCourse = server.create('course', {
    year: 2014,
    school: 1,
    published: false,
    publishedAsTbd: false
  });
  visit('/courses');
  click(sortingHeader);
  andThen(function() {
    assert.equal(getElementText(find(firstCourseTitle)), getText(thirdCourse.title));
    assert.equal(getElementText(find(secondCourseTitle)), getText(firstCourse.title));
    assert.equal(getElementText(find(thirdCourseTitle)), getText(secondCourse.title));
    click(sortingHeader).then(()=>{
      assert.equal(getElementText(find(firstCourseTitle)), getText(secondCourse.title));
      assert.equal(getElementText(find(secondCourseTitle)), getText(firstCourse.title));
      assert.equal(getElementText(find(thirdCourseTitle)), getText(thirdCourse.title));
    });
  });
});

test('developer users can lock and unlock course', function(assert) {
  assert.expect(6);
  const firstCourseRow = '.list tbody tr:eq(0)';
  const secondCourseRow = '.list tbody tr:eq(1)';
  const firstCourseLockedIcon = `${firstCourseRow} td:eq(6) i:eq(0)`;
  const secondCourseLockedIcon = `${secondCourseRow} td:eq(6) i:eq(0)`;
  server.create('academicYear', {id: 2014});
  server.create('userRole', {
    title: 'Developer'
  });
  server.db.users.update(4136, {roles: [1]});
  server.create('course', {
    year: 2014,
    school: 1,
    published: true,
    publishedAsTbd: false,
    locked: true,
  });
  server.create('course', {
    year: 2014,
    school: 1,
    published: true,
    publishedAsTbd: true,
    locked: false,
  });
  visit('/courses');
  andThen(function() {
    assert.ok(find(firstCourseLockedIcon).hasClass('fa-lock'), 'first course is locked');
    assert.ok(find(firstCourseLockedIcon).hasClass('clickable'), 'first course is clickable');
    assert.ok(find(secondCourseLockedIcon).hasClass('fa-unlock'), 'second course is unlocked');
    assert.ok(find(secondCourseLockedIcon).hasClass('clickable'), 'second course is clickable');
    click(find(firstCourseLockedIcon));
    click(find(secondCourseLockedIcon));
    andThen(()=>{
      assert.ok(find(firstCourseLockedIcon).hasClass('fa-unlock'), 'first course is now unlocked');
      assert.ok(find(secondCourseLockedIcon).hasClass('fa-lock'), 'second course is now locked');
    });
  });
});

test('course directors users can lock but not unlock course', function(assert) {
  assert.expect(6);
  const firstCourseRow = '.list tbody tr:eq(0)';
  const secondCourseRow = '.list tbody tr:eq(1)';
  const firstCourseLockedIcon = `${firstCourseRow} td:eq(6) i:eq(0)`;
  const secondCourseLockedIcon = `${secondCourseRow} td:eq(6) i:eq(0)`;
  server.create('academicYear', {id: 2014});
  server.create('course', {
    year: 2014,
    school: 1,
    published: true,
    publishedAsTbd: false,
    locked: true,
    directors: [4136],
  });
  server.create('course', {
    year: 2014,
    school: 1,
    published: true,
    publishedAsTbd: true,
    locked: false,
    directors: [4136],
  });
  visit('/courses');
  andThen(function() {
    assert.ok(find(firstCourseLockedIcon).hasClass('fa-lock'), 'first course is locked');
    assert.notOk(find(firstCourseLockedIcon).hasClass('clickable'), 'first course is not clickable');
    assert.ok(find(secondCourseLockedIcon).hasClass('fa-unlock'), 'second course is unlocked');
    assert.ok(find(secondCourseLockedIcon).hasClass('clickable'), 'second course is clickable');
    click(find(firstCourseLockedIcon));
    click(find(secondCourseLockedIcon));
    andThen(()=>{
      assert.ok(find(firstCourseLockedIcon).hasClass('fa-lock'), 'first course is still locked');
      assert.ok(find(secondCourseLockedIcon).hasClass('fa-lock'), 'second course is now locked');
    });
  });
});

test('non-privileged users cannot lock and unlock course but can see the icon', function(assert) {
  assert.expect(6);
  const firstCourseRow = '.list tbody tr:eq(0)';
  const secondCourseRow = '.list tbody tr:eq(1)';
  const firstCourseLockedIcon = `${firstCourseRow} td:eq(6) i:eq(0)`;
  const secondCourseLockedIcon = `${secondCourseRow} td:eq(6) i:eq(0)`;
  server.create('academicYear', {id: 2014});
  server.create('course', {
    year: 2014,
    school: 1,
    published: true,
    publishedAsTbd: false,
    locked: true,
  });
  server.create('course', {
    year: 2014,
    school: 1,
    published: true,
    publishedAsTbd: true,
    locked: false,
  });
  visit('/courses');
  andThen(function() {
    assert.ok(find(firstCourseLockedIcon).hasClass('fa-lock'), 'first course is locked');
    assert.notOk(find(firstCourseLockedIcon).hasClass('clickable'), 'first course is clickable');
    assert.ok(find(secondCourseLockedIcon).hasClass('fa-unlock'), 'second course is unlocked');
    assert.notOk(find(secondCourseLockedIcon).hasClass('clickable'), 'second course is clickable');
    click(find(firstCourseLockedIcon));
    click(find(secondCourseLockedIcon));
    andThen(()=>{
      assert.ok(find(firstCourseLockedIcon).hasClass('fa-lock'), 'first course is still locked');
      assert.ok(find(secondCourseLockedIcon).hasClass('fa-unlock'), 'second course is still unlocked');
    });
  });
});

test('title filter escapes regex', async function(assert) {
  server.create('academicYear', {id: 2014});
  assert.expect(4);
  let firstCourse = server.create('course', {
    title: 'yes\\no',
    year: 2014,
    school: 1,
  });
  const courses = '.list tbody tr';
  const firstCourseTitle = `${courses}:eq(0) td:eq(0)`;

  await visit('/courses');
  assert.equal(1, find(courses).length);
  assert.equal(getElementText(firstCourseTitle), getText(firstCourse.title));
  await fillIn('.titlefilter input', '\\');
  assert.equal(1, find(courses).length);
  assert.equal(getElementText(firstCourseTitle), getText(firstCourse.title));
});
