/* global moment */
import Ember from 'ember';
import {
  module,
  test
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';
import { openDatepicker } from 'ember-pikaday/helpers/pikaday';

var application;
var fixtures = {};
var url = '/courses/1';
module('Acceptance: Course - Overview', {
  beforeEach: function() {
    application = startApp();
    server.create('user', {id: 4136});
    server.create('school');
    fixtures.clerkshipTypes = [];
    fixtures.clerkshipTypes.pushObjects(server.createList('courseClerkshipType', 2));
  },

  afterEach: function() {
    Ember.run(application, 'destroy');
  }
});

test('check fields', function(assert) {
  var course = server.create('course', {
    year: 2013,
    owningSchool: 1,
    clerkshipType: 3,
    externalId: 123,
    level: 3
  });
  var clerkshipType = server.create('courseClerkshipType', {
    courses: [1]
  });
  visit(url);

  andThen(function() {
    assert.equal(currentPath(), 'course.index');
    var container = find('.course-overview');
    var startDate = moment(course.startDate).format('MM/DD/YY');
    assert.equal(getElementText(find('.coursestartdate div', container)), startDate);
    assert.equal(getElementText(find('.courseexternalid div', container)), 123);
    assert.equal(getElementText(find('.courselevel div', container)), 3);
    var endDate = moment(course.endDate).format('MM/DD/YY');
    assert.equal(getElementText(find('.courseenddate div', container)), endDate);
    assert.equal(getElementText(find('.clerkshiptype div', container)), getText(clerkshipType.title));
  });
});

test('check detail fields', function(assert) {
  var course = server.create('course', {
    year: 2013,
    owningSchool: 1,
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
  var course = server.create('course', {
    year: 2013,
    owningSchool: 1,
  });
  visit(url);
  andThen(function() {
    assert.equal(getElementText(find('.course-overview .clerkshiptype div')), getText('Not a Clerkship'));
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
      click(find('.clerkshiptype .actions .save', container));
      andThen(function(){
        assert.equal(getElementText(find('.clerkshiptype .editable', container)), getText(fixtures.clerkshipTypes[1].title));
      });
    });
  });
});

test('remove clerkship type', function(assert) {
  var course = server.create('course', {
    year: 2013,
    owningSchool: 1,
    clerkshipType: 3,
  });
  var clerkshipType = server.create('courseClerkshipType', {
    courses: [1]
  });
  visit(url + '?details=true');

  andThen(function() {
    var container = find('.course-overview');
    click(find('.clerkshiptype .editable', container));
    andThen(function(){
      pickOption(find('.clerkshiptype select', container), 'Not a Clerkship', assert);
      click(find('.clerkshiptype .actions .save', container));
      andThen(function(){
        assert.equal(getElementText(find('.clerkshiptype .editable', container)), getText('Not a Clerkship'));
      });
    });
  });
});

test('open and close details', function(assert) {
  var course = server.create('course', {
    year: 2013,
    owningSchool: 1
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
  var course = server.create('course', {
    year: 2013,
    owningSchool: 1,
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
      click(find('.title .editinplace .actions .save', container));
      andThen(function(){
        assert.equal(getElementText(find('.title h2', container)), getText('test new title'));
      });
    });
  });
});

test('change start date', function(assert) {
  var course = server.create('course', {
    year: 2013,
    owningSchool: 1,
  });
  var startDate = moment(course.startDate).format('MM/DD/YY');
  visit(url);
  andThen(function() {
    assert.equal(getElementText(find('.course-overview .coursestartdate div')), startDate);
  });
  visit(url + '?details=true');
  andThen(function() {
    var container = find('.course-overview');
    assert.equal(getElementText(find('.coursestartdate div', container)), startDate);
    click(find('.coursestartdate .editable', container));
    andThen(function(){
      var input = find('.coursestartdate .editinplace input', container);
      assert.equal(getText(input.val()), getText(startDate));
      var interactor = openDatepicker(find('.coursestartdate input', container));
      assert.equal(interactor.selectedYear(), moment(course.startDate).format('YYYY'));
      var newDate = moment(course.startDate).add(1, 'year').add(1, 'month');
      interactor.selectDate(newDate.toDate());
      click(find('.coursestartdate .editinplace .actions .save', container));
      andThen(function(){
        assert.equal(getElementText(find('.coursestartdate div', container)), newDate.format('MM/DD/YY'));
      });

    });
  });
});

test('change end date', function(assert) {
  var course = server.create('course', {
    year: 2013,
    owningSchool: 1,
  });
  var endDate = moment(course.endDate).format('MM/DD/YY');
  visit(url);
  andThen(function() {
    assert.equal(getElementText(find('.course-overview .courseenddate div')), endDate);
  });
  visit(url + '?details=true');
  andThen(function() {
    var container = find('.course-overview');
    assert.equal(getElementText(find('.courseenddate div', container)), endDate);
    click(find('.courseenddate .editable', container));
    andThen(function(){
      var input = find('.courseenddate .editinplace input', container);
      assert.equal(getText(input.val()), getText(endDate));
      var interactor = openDatepicker(find('.courseenddate input', container));
      assert.equal(interactor.selectedYear(), moment(course.endDate).format('YYYY'));
      var newDate = moment(course.endDate).add(1, 'year').add(1, 'month');
      interactor.selectDate(newDate.toDate());
      click(find('.courseenddate .editinplace .actions .save', container));
      andThen(function(){
        assert.equal(getElementText(find('.courseenddate div', container)), newDate.format('MM/DD/YY'));
      });

    });
  });
});

test('change externalId', function(assert) {
  var course = server.create('course', {
    year: 2013,
    owningSchool: 1,
    externalId: 'abc123'
  });
  visit(url);
  andThen(function() {
    assert.equal(getElementText(find('.course-overview .courseexternalid div')), getText('abc123'));
  });
  visit(url + '?details=true');
  andThen(function() {
    var container = find('.course-overview');
    assert.equal(getElementText(find('.courseexternalid div', container)), getText('abc123'));
    click(find('.courseexternalid .editable', container));
    andThen(function(){
      var input = find('.courseexternalid .editinplace input', container);
      assert.equal(getText(input.val()), getText('abc123'));
      fillIn(input, 'testnewid');
      click(find('.courseexternalid .editinplace .actions .save', container));
      andThen(function(){
        assert.equal(getElementText(find('.courseexternalid div', container)), getText('testnewid'));
      });
    });
  });
});

test('change level', function(assert) {
  var course = server.create('course', {
    year: 2013,
    owningSchool: 1,
    level: 3
  });
  visit(url);
  andThen(function() {
    assert.equal(getElementText(find('.course-overview .courselevel div')), 3);
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
      click(find('.courselevel .actions .save', container));
      andThen(function(){
        assert.equal(getElementText(find('.courselevel .editable', container)), 1);
      });
    });
  });
});
