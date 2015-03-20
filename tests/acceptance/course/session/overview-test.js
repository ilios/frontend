/* global moment */
import Ember from 'ember';
import {
  module,
  test
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';

var application;
var fixtures = {};
var url = '/course/1/session/1';
module('Acceptance: Session - Overview', {
  beforeEach: function() {
    application = startApp();
    server.create('user', {id: 4136});
    server.create('school');
    server.create('educationalYear');
    server.create('course');
    fixtures.sessionType = server.create('sessionType');
    fixtures.sessionDescription = server.create('sessionDescription');
  },

  afterEach: function() {
    Ember.run(application, 'destroy');
  }
});

test('check fields', function(assert) {

  var session = server.create('session', {
    course: 1,
    sessionType: 1,
    sessionDescription: 1,
  });
  visit(url);

  andThen(function() {
    assert.equal(currentPath(), 'course.session');
    var container = find('.session-overview');
    assert.equal(getElementText(find('.sessiontype .content', container)), getText(fixtures.sessionType.title));
    assert.equal(getElementText(find('.sessiondescription .content', container)), getText(fixtures.sessionDescription.description));
    assert.equal(find('.sessionilmhours', container).length, 0);
    assert.equal(find('.sessionilmduedate', container).length, 0);
  });
});

test('check remove ilm', function(assert) {
  var ilmSession = server.create('ilmSession', {
    session: 1
  });
  var session = server.create('session', {
    course: 1,
    ilmSessionFacet: 1
  });
  visit(url);

  andThen(function() {
    assert.equal(currentPath(), 'course.session');
    var container = find('.session-overview');
    assert.equal(find('.sessionilmhours', container).length, 1);
    assert.equal(find('.sessionilmduedate', container).length, 1);
    var dueDate = moment(ilmSession.dueDate).format('MM/DD/YY');
    assert.equal(getElementText(find('.sessionilmhours .content', container)), ilmSession.hours);
    assert.equal(getElementText(find('.sessionilmduedate .content', container)), dueDate);
    click(find('.independentlearningcontrol', container));
    andThen(function(){
      assert.equal(find('.sessionilmhours', container).length, 0);
      assert.equal(find('.sessionilmduedate', container).length, 0);
    });
  });
});

test('check add ilm', function(assert) {

  var session = server.create('session', {
    course: 1,
    sessionType: 1,
    description: 'some text',
  });
  visit(url);

  andThen(function() {
    assert.equal(currentPath(), 'course.session');
    var container = find('.session-overview');
    click(find('.independentlearningcontrol', container));
    andThen(function(){
      assert.equal(find('.sessionilmhours', container).length, 1);
      assert.equal(find('.sessionilmduedate', container).length, 1);
      assert.equal(getElementText(find('.sessionilmhours .content', container)), 1);
    });
  });
});
