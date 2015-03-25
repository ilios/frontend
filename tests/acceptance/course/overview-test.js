/* global moment */
import Ember from 'ember';
import {
  module,
  test
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';

var application;
var fixtures = {};
var url = '/course/1';
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
    assert.equal(getElementText(find('.coursestartdate .content', container)), startDate);
    assert.equal(getElementText(find('.courseexternalid .content', container)), 123);
    assert.equal(getElementText(find('.courselevel .content', container)), 3);
    var endDate = moment(course.endDate).format('MM/DD/YY');
    assert.equal(getElementText(find('.courseenddate .content', container)), endDate);
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
    click('.detailCollapsedControl', details).then(function(){
      assert.equal(find('.detail-title', details).length, 7);
      assert.equal(currentURL(), '/course/1?details=true');
    });
  });

  andThen(function() {
    var details = find('#course-details .detail-view-details');
    assert.equal(find('.detail-title', details).length, 7);
    click('.detailCollapsedControl', details).then(function(){
      assert.equal(find('.detail-title', details).length, 1);
      assert.equal(currentURL(), '/course/1');
    });
  });
});
