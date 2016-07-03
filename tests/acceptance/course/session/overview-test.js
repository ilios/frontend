import destroyApp from '../../../helpers/destroy-app';
import moment from 'moment';
import {
  module,
  test
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';
import { openDatepicker } from 'ember-pikaday/helpers/pikaday';
import Ember from 'ember';

var application;
var fixtures = {};
var url = '/courses/1/sessions/1';
module('Acceptance: Session - Overview', {
  beforeEach: function() {
    application = startApp();
    setupAuthentication(application, false);
    server.create('school', {
      sessionTypes: [1,2]
    });
    server.create('academicYear');
    server.create('course');
    fixtures.sessionTypes = server.createList('sessionType', 2, {
      school: 1
    });
    fixtures.sessionDescription = server.create('sessionDescription');
  },

  afterEach: function() {
    destroyApp(application);
  }
});

test('check fields', function(assert) {
  server.create('user', {
    id: 4136,
    roles: [1],
  });
  server.create('userRole', {
    users: [4136],
    title: 'course director'
  });
  server.create('session', {
    course: 1,
    sessionType: 1,
    sessionDescription: 1,
  });
  visit(url);

  andThen(function() {
    assert.equal(currentPath(), 'course.session.index');
    var container = find('.session-overview');
    assert.equal(getElementText(find('.sessiontype .editable', container)), getText('session type 0'));
    assert.equal(getElementText(find('.sessiondescription .content', container)), getText(fixtures.sessionDescription.description));
    assert.equal(find('.sessionilmhours', container).length, 0);
  });
});

test('check remove ilm', function(assert) {
  server.create('user', {
    id: 4136
  });
  var ilmSession = server.create('ilmSession', {
    session: 1
  });
  server.create('session', {
    course: 1,
    ilmSession: 1
  });
  visit(url);

  andThen(function() {
    assert.equal(currentPath(), 'course.session.index');
    var container = find('.session-overview');
    assert.equal(find('.sessionilmhours', container).length, 1);
    assert.equal(find('.sessionilmduedate', container).length, 1);
    var dueDate = moment(ilmSession.dueDate).format('MM/DD/YY');
    assert.equal(getElementText(find('.sessionilmhours .content', container)), ilmSession.hours);
    assert.equal(getElementText(find('.sessionilmduedate .editable', container)), dueDate);
    click(find('.independentlearningcontrol .switch-handle', container));
    andThen(function(){
      assert.equal(find('.sessionilmhours', container).length, 0);
      assert.equal(find('.sessionilmduedate', container).length, 0);
    });
  });
});

test('check add ilm', function(assert) {
  server.create('user', {
    id: 4136
  });

  server.create('session', {
    course: 1,
    sessionType: 1,
    description: 'some text',
  });
  visit(url);

  andThen(function() {
    assert.equal(currentPath(), 'course.session.index');
    var container = find('.session-overview');
    click(find('.independentlearningcontrol .switch-handle', container));
    andThen(function(){
      assert.equal(find('.sessionilmhours', container).length, 1);
      assert.equal(find('.sessionilmduedate', container).length, 1);
      assert.equal(find('.sessionassociatedgroups', container).length, 0);
      assert.equal(getElementText(find('.sessionilmhours .content', container)), 1);
    });
  });
});

test('change ilm hours', function(assert) {
  server.create('user', {
    id: 4136
  });
  var ilmSession = server.create('ilmSession', {
    session: 1
  });
  server.create('session', {
    course: 1,
    ilmSession: 1
  });
  visit(url);

  andThen(function() {
    assert.equal(currentPath(), 'course.session.index');
    assert.equal(find('.sessionilmhours', container).length, 1);
    var container = find('.sessionilmhours');
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
  server.create('user', {
    id: 4136
  });
  var ilmSession = server.create('ilmSession', {
    session: 1
  });
  server.create('session', {
    course: 1,
    ilmSession: 1
  });
  visit(url);
  andThen(function() {
    var container = find('.sessionilmduedate');
    var dueDate = moment(ilmSession.dueDate).format('MM/DD/YY');
    assert.equal(getElementText(find('.editable', container)), dueDate);
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
        assert.equal(getElementText(find('.editable', container)), newDate.format('MM/DD/YY'));
      });
    });
  });
});

test('change title', function(assert) {
  server.create('user', {
    id: 4136
  });
  server.create('session', {
    course: 1,
    sessionType: 1
  });
  visit(url);
  andThen(function() {
    var container = find('.session-header .title');
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
  server.create('user', {
    id: 4136
  });
  server.create('session', {
    course: 1,
    sessionType: 1
  });
  visit(url);
  andThen(function() {
    var container = find('.session-overview');
    assert.equal(getElementText(find('.sessiontype .editable', container)), getText('session type 0'));
    click(find('.sessiontype .editable', container));
    andThen(function(){

      let options = find('.sessiontype select option', container);
      assert.equal(options.length, 2);
      assert.equal(getElementText(options.eq(0)), getText('session type 0'));
      assert.equal(getElementText(options.eq(1)), getText('session type 1'));
      pickOption(find('.sessiontype select', container), 'session type 1', assert);
      click(find('.sessiontype .actions .done', container));
      andThen(function(){
        assert.equal(getElementText(find('.sessiontype .editable', container)), getText('session type 1'));
      });
    });
  });
});

test('change suplimental', function(assert) {
  server.create('user', {
    id: 4136
  });
  server.create('session', {
    course: 1,
    sessionType: 2
  });
  visit(url);
  andThen(function() {
    var container = find('.session-overview');
    assert.ok(!find('.sessionsupplemental .editinplace input', container).is(':checked'), 'initiall not checked');
    click(find('.sessionsupplemental .editinplace .control', container));
    andThen(function(){
      assert.ok(find('.sessionsupplemental .editinplace input', container).is(':checked'), 'result of clicking it checked');
    });
  });
});

test('change special attire', function(assert) {
  server.create('user', {
    id: 4136
  });
  server.create('session', {
    course: 1,
    sessionType: 2
  });
  visit(url);
  andThen(function() {
    var container = find('.session-overview');
    assert.ok(!find('.sessionspecialattire .editinplace input', container).is(':checked'), 'initiall not checked');
    click(find('.sessionspecialattire .editinplace .control', container));
    andThen(function(){
      assert.ok(find('.sessionspecialattire .editinplace input', container).is(':checked'));
    });
  });
});

test('change special equipment', function(assert) {
  server.create('user', {
    id: 4136
  });
  server.create('session', {
    course: 1,
    sessionType: 2
  });
  visit(url);
  andThen(function() {
    var container = find('.session-overview');
    assert.ok(!find('.sessionspecialequipment .editinplace input', container).is(':checked'), 'initiall not checked');
    click(find('.sessionspecialequipment .editinplace .control', container));
    andThen(function(){
      assert.ok(find('.sessionspecialequipment .editinplace input', container).is(':checked'));
    });
  });
});

test('change description', function(assert) {
  server.create('user', {
    id: 4136
  });
  server.create('session', {
    course: 1,
    sessionType: 1,
    sessionDescription: 1
  });
  visit(url);
  andThen(function() {
    var description = getText(fixtures.sessionDescription.description);
    var container = find('.sessiondescription');
    assert.equal(getElementText(find('.content', container)), description);
    click(find('.editable', container));
    andThen(function(){
      //wait for the editor to load
      Ember.run.later(()=>{
        let editor = find('.sessiondescription .froalaEditor');
        let editorContents = editor.data('froala.editor').$el.text();
        assert.equal(getText(editorContents), description);
        editor.froalaEditor('html.set', 'test new description');
        editor.froalaEditor('events.trigger', 'contentChanged');
        click(find('.editinplace .actions .done', container));
        andThen(function(){
          assert.equal(getElementText(find('.content', container)), getText('test new description'));
        });
      }, 100);
    });
  });
});

test('add description', function(assert) {
  server.create('user', {
    id: 4136
  });
  server.create('session', {
    course: 1,
    sessionType: 1
  });
  visit(url);
  andThen(function() {
    var container = find('.sessiondescription');
    assert.equal(getElementText(find('.content', container)), getText('Click to edit'));
    click(find('.editable', container));
    andThen(function(){
      //wait for the editor to load
      Ember.run.later(()=>{
        let editor = find('.sessiondescription .froalaEditor');
        let editorContents = editor.data('froala.editor').$el.text();
        assert.equal(getText(editorContents), '');
        editor.froalaEditor('html.set', 'test new description');
        editor.froalaEditor('events.trigger', 'contentChanged');
        click(find('.editinplace .actions .done', container));
        andThen(function(){
          assert.equal(getElementText(find('.content', container)), getText('test new description'));
        });
      }, 100);
    });
  });
});

test('click copy', function(assert) {
  server.create('user', {
    id: 4136,
    roles: [1],
  });
  server.create('userRole', {
    users: [4136],
    title: 'course director'
  });
  server.create('session', {
    course: 1,
    sessionType: 1
  });

  const copy = '.session-overview a.copy';
  visit(url);
  click(copy);

  andThen(function() {
    assert.equal(currentPath(), 'course.session.copy');
  });
});

test('copy hidden from instructors', function(assert) {
  server.create('user', {
    id: 4136,
    roles: [1],
  });
  server.create('userRole', {
    users: [4136],
    title: 'instructor'
  });
  server.create('session', {
    course: 1,
    sessionType: 1
  });
  visit(url);
  const container = '.session-overview';
  const copy = `${container} a.copy`;

  andThen(function() {
    assert.equal(currentPath(), 'course.session.index');
    assert.equal(find(copy).length, 0)
  });
});

test('copy visible to developers', function(assert) {
  server.create('user', {
    id: 4136,
    roles: [1],
  });
  server.create('userRole', {
    users: [4136],
    title: 'developer'
  });
  server.create('session', {
    course: 1,
    sessionType: 1
  });
  visit(url);
  const container = '.session-overview';
  const copy = `${container} a.copy`;

  andThen(function() {
    assert.equal(currentPath(), 'course.session.index');
    assert.equal(find(copy).length, 1)
  });
});

test('copy visible to course directors', function(assert) {
  server.create('user', {
    id: 4136,
    roles: [1],
  });
  server.create('userRole', {
    users: [4136],
    title: 'course director'
  });
  server.create('session', {
    course: 1,
    sessionType: 1
  });
  visit(url);
  const container = '.session-overview';
  const copy = `${container} a.copy`;

  andThen(function() {
    assert.equal(currentPath(), 'course.session.index');
    assert.equal(find(copy).length, 1)
  });
});

test('copy hidden on copy route', function(assert) {
  server.create('user', {
    id: 4136,
    roles: [1],
  });
  server.create('userRole', {
    users: [4136],
    title: 'course director'
  });
  server.create('session', {
    course: 1,
    sessionType: 1
  });
  visit(`${url}/copy`);
  const container = '.session-overview';
  const copy = `${container} a.copy`;

  andThen(function() {
    assert.equal(currentPath(), 'course.session.copy');
    assert.equal(find(copy).length, 0)
  });
});
