import moment from 'moment';
import Ember from 'ember';
import {
  module,
  test
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';
import {c as testgroup} from 'ilios/tests/helpers/test-groups';
import { openDatepicker } from 'ember-pikaday/helpers/pikaday';

const { isEmpty } = Ember;

var application;
var fixtures = {};
var url = '/courses/1';
module('Acceptance: Course - Overview' + testgroup, {
  beforeEach: function() {
    application = startApp();
    authenticateSession();
    server.create('user', {
      id: 4136,
      roles: [1]
    });
    server.create('school');
    fixtures.clerkshipTypes = [];
    fixtures.clerkshipTypes.pushObjects(server.createList('courseClerkshipType', 2));
  },

  afterEach: function() {
    Ember.run(application, 'destroy');
  }
});

test('check fields', function(assert) {
  server.create('user', {
    directedCourses: [1],
    firstName: 'A',
    lastName: 'Director'
  });
  var course = server.create('course', {
    year: 2013,
    school: 1,
    clerkshipType: 3,
    externalId: 123,
    level: 3,
    directors: [2]
  });
  var clerkshipType = server.create('courseClerkshipType', {
    courses: [1]
  });
  visit(url);

  andThen(function() {
    assert.equal(currentPath(), 'course.index');
    var container = find('.course-overview');
    var startDate = moment(course.startDate).format('MM/DD/YY');
    assert.equal(getElementText(find('.coursestartdate', container)), startDate);
    assert.equal(getElementText(find('.courseexternalid', container)), 123);
    assert.equal(getElementText(find('.courselevel', container)), 3);
    var endDate = moment(course.endDate).format('MM/DD/YY');
    assert.equal(getElementText(find('.courseenddate', container)), endDate);
    assert.equal(getElementText(find('.clerkshiptype', container)), getText(clerkshipType.title));
    assert.equal(getElementText(find('.coursedirectors li', container)), getText('A Director'));
  });
});

test('check detail fields', function(assert) {
  var course = server.create('course', {
    year: 2013,
    school: 1,
    clerkshipType: 3,
    externalId: 123,
    level: 3
  });
  var clerkshipType = server.create('courseClerkshipType', {
    courses: [1]
  });
  visit(url + '?details=true');

  andThen(function() {
    assert.equal(currentPath(), 'course.index');
    var container = find('.course-overview');
    var startDate = moment(course.startDate).format('MM/DD/YY');
    assert.equal(getElementText(find('.coursestartdate .editable', container)), startDate);
    assert.equal(getElementText(find('.courseexternalid .editable', container)), 123);
    assert.equal(getElementText(find('.courselevel .editable', container)), 3);
    var endDate = moment(course.endDate).format('MM/DD/YY');
    assert.equal(getElementText(find('.courseenddate .editable', container)), endDate);
    assert.equal(getElementText(find('.clerkshiptype .editable', container)), getText(clerkshipType.title));
  });
});

test('pick clerkship type', function(assert) {
  server.create('course', {
    year: 2013,
    school: 1,
  });
  visit(url);
  andThen(function() {
    assert.equal(getElementText(find('.course-overview .clerkshiptype')), getText('Not a Clerkship'));
  });
  visit(url + '?details=true');
  andThen(function() {
    var container = find('.course-overview');
    assert.equal(getElementText(find('.clerkshiptype .editable', container)), getText('Not a Clerkship'));
    click(find('.clerkshiptype .editable', container));
    andThen(function(){
      let options = find('.clerkshiptype select option', container);
      //add one for the blank option
      assert.equal(options.length, fixtures.clerkshipTypes.length + 1);
      for(let i = 0; i < fixtures.clerkshipTypes.length + 1; i++){
        let title = i===0?'Not a Clerkship':fixtures.clerkshipTypes[i-1].title;
        assert.equal(getElementText(options.eq(i)), getText(title));
      }
      pickOption(find('.clerkshiptype select', container), fixtures.clerkshipTypes[1].title, assert);
      click(find('.clerkshiptype .actions .done', container));
      andThen(function(){
        assert.equal(getElementText(find('.clerkshiptype .editable', container)), getText(fixtures.clerkshipTypes[1].title));
      });
    });
  });
});

test('remove clerkship type', function(assert) {
  server.create('course', {
    year: 2013,
    school: 1,
    clerkshipType: 3,
  });
  server.create('courseClerkshipType', {
    courses: [1]
  });
  visit(url + '?details=true');

  andThen(function() {
    var container = find('.course-overview');
    click(find('.clerkshiptype .editable', container));
    andThen(function(){
      pickOption(find('.clerkshiptype select', container), 'Not a Clerkship', assert);
      click(find('.clerkshiptype .actions .done', container));
      andThen(function(){
        assert.equal(getElementText(find('.clerkshiptype .editable', container)), getText('Not a Clerkship'));
      });
    });
  });
});

test('open and close details', function(assert) {
  server.create('course', {
    year: 2013,
    school: 1
  });
  visit(url);

  andThen(function() {
    assert.equal(currentPath(), 'course.index');
    var details = find('#course-details .detail-view-details');
    assert.equal(find('.detail-title', details).length, 1);
    click('.detail-collapsed-control', details).then(function(){
      assert.equal(find('.detail-title', details).length, 7);
      assert.equal(currentURL(), '/courses/1?details=true');
    });
  });

  andThen(function() {
    var details = find('#course-details .detail-view-details');
    assert.equal(find('.detail-title', details).length, 7);
    click('.detail-collapsed-control', details).then(function(){
      assert.equal(find('.detail-title', details).length, 1);
      assert.equal(currentURL(), '/courses/1');
    });
  });
});

test('change title', function(assert) {
  server.create('course', {
    year: 2013,
    school: 1,
  });
  visit(url);
  andThen(function() {
    assert.equal(getElementText(find('.detail-header .title h2')), getText('course 0'));
  });
  visit(url + '?details=true');
  andThen(function() {
    var container = find('.detail-header');
    assert.equal(getElementText(find('.title h2', container)), getText('course 0'));
    click(find('.title h2 .editable', container));
    andThen(function(){
      var input = find('.title .editinplace input', container);
      assert.equal(getText(input.val()), getText('course 0'));
      fillIn(input, 'test new title');
      click(find('.title .editinplace .actions .done', container));
      andThen(function(){
        assert.equal(getElementText(find('.title h2', container)), getText('test new title'));
      });
    });
  });
});

test('change start date', function(assert) {
  var course = server.create('course', {
    year: 2013,
    school: 1,
  });
  var startDate = moment(course.startDate).format('MM/DD/YY');
  visit(url);
  andThen(function() {
    assert.equal(getElementText(find('.course-overview .coursestartdate')), startDate);
  });
  visit(url + '?details=true');
  andThen(function() {
    var container = find('.course-overview');
    assert.equal(getElementText(find('.coursestartdate', container)), startDate);
    click(find('.coursestartdate .editable', container));
    andThen(function(){
      var input = find('.coursestartdate .editinplace input', container);
      assert.equal(getText(input.val()), getText(startDate));
      var interactor = openDatepicker(find('.coursestartdate input', container));
      assert.equal(interactor.selectedYear(), moment(course.startDate).format('YYYY'));
      var newDate = moment(course.startDate).add(1, 'year').add(1, 'month');
      interactor.selectDate(newDate.toDate());
      click(find('.coursestartdate .editinplace .actions .done', container));
      andThen(function(){
        assert.equal(getElementText(find('.coursestartdate', container)), newDate.format('MM/DD/YY'));
      });

    });
  });
});

test('change end date', function(assert) {
  var course = server.create('course', {
    year: 2013,
    school: 1,
  });
  var endDate = moment(course.endDate).format('MM/DD/YY');
  visit(url);
  andThen(function() {
    assert.equal(getElementText(find('.course-overview .courseenddate')), endDate);
  });
  visit(url + '?details=true');
  andThen(function() {
    var container = find('.course-overview');
    assert.equal(getElementText(find('.courseenddate', container)), endDate);
    click(find('.courseenddate .editable', container));
    andThen(function(){
      var input = find('.courseenddate .editinplace input', container);
      assert.equal(getText(input.val()), getText(endDate));
      var interactor = openDatepicker(find('.courseenddate input', container));
      assert.equal(interactor.selectedYear(), moment(course.endDate).format('YYYY'));
      var newDate = moment(course.endDate).add(1, 'year').add(1, 'month');
      interactor.selectDate(newDate.toDate());
      click(find('.courseenddate .editinplace .actions .done', container));
      andThen(function(){
        assert.equal(getElementText(find('.courseenddate', container)), newDate.format('MM/DD/YY'));
      });

    });
  });
});

test('change externalId', function(assert) {
  server.create('course', {
    year: 2013,
    school: 1,
    externalId: 'abc123'
  });
  visit(url);
  andThen(function() {
    assert.equal(getElementText(find('.course-overview .courseexternalid')), getText('abc123'));
  });
  visit(url + '?details=true');
  andThen(function() {
    var container = find('.course-overview');
    assert.equal(getElementText(find('.courseexternalid', container)), getText('abc123'));
    click(find('.courseexternalid .editable', container));
    andThen(function(){
      var input = find('.courseexternalid .editinplace input', container);
      assert.equal(getText(input.val()), getText('abc123'));
      fillIn(input, 'testnewid');
      click(find('.courseexternalid .editinplace .actions .done', container));
      andThen(function(){
        assert.equal(getElementText(find('.courseexternalid', container)), getText('testnewid'));
      });
    });
  });
});

test('change level', function(assert) {
  server.create('course', {
    year: 2013,
    school: 1,
    level: 3
  });
  visit(url);
  andThen(function() {
    assert.equal(getElementText(find('.course-overview .courselevel')), 3);
  });
  visit(url + '?details=true');
  andThen(function() {
    var container = find('.course-overview');
    assert.equal(getElementText(find('.courselevel .editable', container)), 3);
    click(find('.courselevel .editable', container));
    andThen(function(){
      let options = find('.courselevel select option', container);
      for(let i = 0; i < 5; i++){
        assert.equal(getElementText(options.eq(i)), i+1);
      }
      pickOption(find('.courselevel select', container), '1', assert);
      click(find('.courselevel .actions .done', container));
      andThen(function(){
        assert.equal(getElementText(find('.courselevel .editable', container)), 1);
      });
    });
  });
});

test('remove director', function(assert) {
  server.create('user', {
    directedCourses: [1],
    firstName: 'A',
    lastName: 'Director'
  });
  server.create('course', {
    year: 2013,
    school: 1,
    externalId: 123,
    level: 3,
    directors: [2]
  });
  visit(url);
  andThen(function() {
    click('.coursedirectors li:eq(0)').then(function(){
      assert.equal(getElementText(find('.coursedirectors li')), '');
    });
  });
});


test('manage directors', function(assert) {

  server.create('user', {
    directedCourses: [1],
    firstName: 'Added',
    lastName: 'Guy',
    roles: [1]
  });
  server.create('user', {
    firstName: 'Disabled',
    lastName: 'Guy',
    enabled: false,
    roles: [1]
  });
  server.create('user', {
    firstName: 'Not a director',
    lastName: 'Guy',
    roles: [3]
  });

  server.create('course', {
    year: 2013,
    school: 1,
    externalId: 123,
    level: 3,
    directors: [2]
  });
  visit(url);
  andThen(function() {
      let directors = find('.coursedirectors');
      let searchBox = find('.search-box', directors);
      assert.equal(searchBox.length, 1);
      searchBox = searchBox.eq(0);
      let searchBoxInput = find('input', searchBox);
      fillIn(searchBoxInput, 'guy');
      click('span.search-icon', searchBox);
      andThen(function(){
        let searchResults = find('.live-search li', directors);
        assert.equal(searchResults.length, 3);
        assert.equal(getElementText($(searchResults[0])), getText('0 guy Mc0son'));
        assert.ok(!$(searchResults[0]).hasClass('inactive'));
        assert.equal(getElementText($(searchResults[1])), getText('Added Guy'));
        assert.ok($(searchResults[1]).hasClass('inactive'));
        assert.equal(getElementText($(searchResults[2])), getText('Disabled Guy'));
        assert.ok($(searchResults[2]).hasClass('inactive'));

        click('.removable-list li:eq(0)', directors).then(function(){
          assert.ok(!$(find('.live-search li:eq(1)', directors)).hasClass('inactive'));
          click(searchResults[0]);
        });
        andThen(function(){
          assert.equal(getElementText(find('.coursedirectors .removable-list')), getText('0 guy Mc0son'));
        });
    });
  });
});

//test for a bug where the search results were not cleared between searches
test('search twice and list should be correct', function(assert) {
  server.create('user', {
    directedCourses: [1],
    firstName: 'Added',
    lastName: 'Guy',
    roles: [1]
  });
  server.create('course', {
    year: 2013,
    school: 1,
    externalId: 123,
    level: 3,
    directors: [2]
  });
  visit(url);
  andThen(function() {
      let directors = find('.coursedirectors');
      let searchBox = find('.search-box', directors);
      assert.equal(searchBox.length, 1);
      searchBox = searchBox.eq(0);
      let searchBoxInput = find('input', searchBox);
      fillIn(searchBoxInput, 'guy');
      click('span.search-icon', searchBox);
      andThen(function(){
        let searchResults = find('.live-search li', directors);
        assert.equal(searchResults.length, 2);
        assert.equal(getElementText($(searchResults[0])), getText('0 guy Mc0son'));
        assert.equal(getElementText($(searchResults[1])), getText('Added Guy'));
        click(searchResults[0]).then(function(){
          let searchBoxInput = find('input', searchBox);
          fillIn(searchBoxInput, 'guy');
          click('span.search-icon', searchBox);
          andThen(function(){
            let searchResults = find('.live-search li', directors);
            assert.equal(searchResults.length, 2);
            assert.equal(getElementText($(searchResults[0])), getText('0 guy Mc0son'));
            assert.equal(getElementText($(searchResults[1])), getText('Added Guy'));
          });
        });
    });
  });
});

test('validations work properly', function(assert) {
  assert.expect(5);

  server.create('course', {
    externalId: 123,
  });

  const externalId = '.courseexternalid .editable';
  const externalIdInput = '.courseexternalid input';
  const errorMessage = '.courseexternalid .error';
  const saveButton = '.courseexternalid .done';
  const cancelButton = '.courseexternalid .cancel';

  visit(url);
  click(externalId);
  fillIn(externalIdInput, '11');
  andThen(() => {
    assert.equal(find(errorMessage).text(), 'is too short (minimum is 3 characters)', 'error message is shown');
  });

  click(saveButton);
  andThen(() => {
    assert.ok(isEmpty(find(externalId)), 'saving does not occur, given validation error');
  });

  click(cancelButton);
  andThen(() => {
    assert.equal(find(externalId).text(), 123, 'canceling reverts external-id back');
  });

  click(externalId);
  fillIn(externalIdInput, '1324~');
  andThen(() => {
    assert.equal(find(errorMessage).text(), "must be alphanumeric ('-' and ':' allowed)", 'error message is shown');
  });

  fillIn(externalIdInput, '12345');
  click(saveButton);
  andThen(() => {
    assert.equal(find(externalId).text().trim(), '12345', 'new id was saved');
  });
});
