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
    fixtures.clerkshipTypes.pushObject(server.create('courseClerkshipType', {
      courses: [1]
    }));
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
    clerkshipType: 1,
    externalId: 123,
    level: 3
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
    assert.equal(getElementText(find('.clerkshiptype div', container)), getText(fixtures.clerkshipTypes[course.clerkshipType - 1].title));
  });
});

test('check detail fields', function(assert) {
  var course = server.create('course', {
    year: 2013,
    owningSchool: 1,
    clerkshipType: 1,
    externalId: 123,
    level: 3
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
    assert.equal(getElementText(find('.clerkshiptype .content', container)), getText(fixtures.clerkshipTypes[course.clerkshipType - 1].title));
  });
});

test('pick clerkship type', function(assert) {
  var course = server.create('course', {
    year: 2013,
    owningSchool: 1,
    clerkshipType: 1,
  });
  visit(url + '?details=true');

  andThen(function() {
    var container = find('.course-overview');
    assert.equal(getElementText(find('.clerkshiptype .content', container)), getText(fixtures.clerkshipTypes[course.clerkshipType - 1].title));
    click(find('.clerkshiptype .editable', container));
    andThen(function(){
      let options = find('.clerkshiptype select option', container);
      assert.equal(options.length, fixtures.clerkshipTypes.length);
      for(let i = 0; i < fixtures.clerkshipTypes.length; i++){
        assert.equal(getElementText(options.eq(i)), getText(fixtures.clerkshipTypes[i].title));
      }
      pickOption(find('.clerkshiptype select', container), fixtures.clerkshipTypes[2].title, assert);
      click(find('.clerkshiptype .actions .save', container));
      andThen(function(){
        assert.equal(getElementText(find('.clerkshiptype .content', container)), getText(fixtures.clerkshipTypes[2].title));
      });
    });
  });
});
