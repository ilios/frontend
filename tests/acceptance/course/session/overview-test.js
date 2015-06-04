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
var url = '/courses/1/sessions/1';
module('Acceptance: Session - Overview', {
  beforeEach: function() {
    application = startApp();
    server.create('user', {id: 4136});
    server.create('school', {
      sessionTypes: [1,2]
    });
    server.create('educationalYear');
    server.create('course');
    fixtures.selectedSessionType = server.create('sessionType', {
      sessions: [1],
      owningSchool: 1
    });
    fixtures.otherSessionType = server.create('sessionType', {
      owningSchool: 1
    });
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
    assert.equal(currentPath(), 'course.session.index');
    var container = find('.session-overview');
    assert.equal(getElementText(find('.sessiontype div', container)), getText(fixtures.selectedSessionType.title));
    assert.equal(getElementText(find('.sessiondescription .content', container)), getText(fixtures.sessionDescription.description));
    assert.equal(find('.sessionilmhours', container).length, 0);
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
    assert.equal(currentPath(), 'course.session.index');
    var container = find('.session-overview');
    assert.equal(find('.sessionilmhours', container).length, 1);
    assert.equal(find('.sessionilmduedate', container).length, 1);
    var dueDate = moment(ilmSession.dueDate).format('MM/DD/YY');
    assert.equal(getElementText(find('.sessionilmhours .content', container)), ilmSession.hours);
    assert.equal(getElementText(find('.sessionilmduedate div', container)), dueDate);
    click(find('.independentlearningcontrol input', container));
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
    assert.equal(currentPath(), 'course.session.index');
    var container = find('.session-overview');
    click(find('.independentlearningcontrol input', container));
    andThen(function(){
      assert.equal(find('.sessionilmhours', container).length, 1);
      assert.equal(find('.sessionilmduedate', container).length, 1);
      assert.equal(find('.sessionassociatedgroups', container).length, 0);
      assert.equal(getElementText(find('.sessionilmhours .content', container)), 1);
    });
  });
});

test('change ilm hours', function(assert) {
  var ilmSession = server.create('ilmSession', {
    session: 1
  });
  var session = server.create('session', {
    course: 1,
    ilmSessionFacet: 1
  });
  visit(url);

  andThen(function() {
    assert.equal(currentPath(), 'course.session.index');
    assert.equal(find('.sessionilmhours', container).length, 1);
    var container = find('#session-details .sessionilmhours');
    assert.equal(getElementText(find('.content', container)), ilmSession.hours);
    click(find('.editable', container));
    andThen(function(){
      var input = find('.editinplace input', container);
      assert.equal(getText(input.val()), ilmSession.hours);
      fillIn(input, 23);
      click(find('.editinplace .actions .done', container));
      andThen(function(){
        assert.equal(getElementText(find('.content', container)), 23);
      });
    });
  });
});

test('change ilm due date', function(assert) {
  var ilmSession = server.create('ilmSession', {
    session: 1
  });
  var session = server.create('session', {
    course: 1,
    ilmSessionFacet: 1
  });
  visit(url);
  andThen(function() {
    var container = find('#session-details .sessionilmduedate');
    var dueDate = moment(ilmSession.dueDate).format('MM/DD/YY');
    assert.equal(getElementText(find('div', container)), dueDate);
    click(find('.editable', container));
    andThen(function(){
      var input = find('.editinplace input', container);
      assert.equal(getText(input.val()), getText(dueDate));
      var interactor = openDatepicker(find('input', container));
      assert.equal(interactor.selectedYear(), moment(ilmSession.dueDate).format('YYYY'));
      var newDate = moment(ilmSession.dueDate).add(1, 'year').add(1, 'month');
      interactor.selectDate(newDate.toDate());
      click(find('.editinplace .actions .done', container));
      andThen(function(){
        assert.equal(getElementText(find('div', container)), newDate.format('MM/DD/YY'));
      });
    });
  });
});

test('change title', function(assert) {
  var session = server.create('session', {
    course: 1,
    sessionType: 1
  });
  visit(url);
  andThen(function() {
    var container = find('#session-details .detail-header .title');
    assert.equal(getElementText(container), getText('session 0'));
    click(find('.editable', container));
    andThen(function(){
      var input = find('.editinplace input', container);
      assert.equal(getText(input.val()), getText('session 0'));
      fillIn(input, 'test new title');
      click(find('.editinplace .actions .done', container));
      andThen(function(){
        assert.equal(getElementText(container), getText('test new title'));
      });
    });
  });
});

test('change type', function(assert) {
  var session = server.create('session', {
    course: 1,
    sessionType: 2
  });
  visit(url);
  andThen(function() {
    var container = find('.session-overview');
    assert.equal(getElementText(find('.sessiontype .editable', container)), getText(fixtures.selectedSessionType.title));
    click(find('.sessiontype .editable', container));
    andThen(function(){
      let options = find('.sessiontype select option', container);
      assert.equal(options.length, 2);
      assert.equal(getElementText(options.eq(0)), getText(fixtures.selectedSessionType.title));
      assert.equal(getElementText(options.eq(1)), getText(fixtures.otherSessionType.title));
      pickOption(find('.sessiontype select', container), fixtures.otherSessionType.title, assert);
      click(find('.sessiontype .actions .done', container));
      andThen(function(){
        assert.equal(getElementText(find('.sessiontype .editable', container)), getText(fixtures.otherSessionType.title));
      });
    });
  });
});

test('change suplimental', function(assert) {
  var session = server.create('session', {
    course: 1,
    sessionType: 2
  });
  visit(url);
  andThen(function() {
    var container = find('.session-overview');
    assert.ok(!find('.sessionsupplemental .editinplace input', container).is(':checked'));
    click(find('.sessionsupplemental .editinplace .control', container));
    andThen(function(){
      assert.ok(find('.sessionsupplemental .editinplace input', container).is(':checked'));
    });
  });
});

test('change special attire', function(assert) {
  var session = server.create('session', {
    course: 1,
    sessionType: 2
  });
  visit(url);
  andThen(function() {
    var container = find('.session-overview');
    assert.ok(!find('.sessionspecialattire .editinplace input', container).is(':checked'));
    click(find('.sessionspecialattire .editinplace .control', container));
    andThen(function(){
      assert.ok(find('.sessionspecialattire .editinplace input', container).is(':checked'));
    });
  });
});

test('change special equipment', function(assert) {
  var session = server.create('session', {
    course: 1,
    sessionType: 2
  });
  visit(url);
  andThen(function() {
    var container = find('.session-overview');
    assert.ok(!find('.sessionspecialequipment .editinplace input', container).is(':checked'));
    click(find('.sessionspecialequipment .editinplace .control', container));
    andThen(function(){
      assert.ok(find('.sessionspecialequipment .editinplace input', container).is(':checked'));
    });
  });
});

test('change description', function(assert) {
  var session = server.create('session', {
    course: 1,
    sessionType: 1,
    sessionDescription: 1
  });
  visit(url);
  andThen(function() {
    var description = getText(fixtures.sessionDescription.description);
    var container = find('#session-details .sessiondescription');
    assert.equal(getElementText(find('.content', container)), description);
    click(find('.editable span', container));
    andThen(function(){
      var input = find('.editinplace textarea', container);
      assert.equal(getText(input.val()), description);
      fillIn(input, 'test new description');
      click(find('.editinplace .actions .done', container));
      andThen(function(){
        assert.equal(getElementText(find('.content', container)), getText('test new description'));
      });
    });
  });
});

test('add description', function(assert) {
  var session = server.create('session', {
    course: 1,
    sessionType: 1
  });
  visit(url);
  andThen(function() {
    var container = find('#session-details .sessiondescription');
    assert.equal(getElementText(find('.content', container)), getText('Click to edit'));
    click(find('.editable span', container));
    andThen(function(){
      var input = find('.editinplace textarea', container);
      assert.equal(getText(input.val()), '');
      fillIn(input, 'test new description');
      click(find('.editinplace .actions .done', container));
      andThen(function(){
        assert.equal(getElementText(find('.content', container)), getText('test new description'));
      });
    });
  });
});
