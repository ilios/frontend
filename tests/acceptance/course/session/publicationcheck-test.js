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
module('Acceptance: Session - Publication Check', {
  beforeEach: function() {
    application = startApp();
    setupAuthentication(application);
    server.create('course', {
      sessions: [1,2]
    });
    server.create('vocabulary', {
      terms: [1],
      school: 1,
    });
    server.createList('sessionType', 2, {
      school: 1
    });
    server.create('sessionDescription', {
      session: 1,
    });
    server.create('school', {
      sessionTypes: [1,2],
      vocabularies: [1],
    });
    server.create('offering', {
      sessions: [1],
    });
    server.create('objective', {
      sessions: [1],
    });
    server.create('term', {
      sessions: [1],
      vocabulary: 1,
    });
    server.create('meshDescriptor', {
      sessions: [1],
    });
  },

  afterEach: function() {
    destroyApp(application);
  }
});

test('full session count', function(assert) {
  server.create('session', {
    course: 1,
    offerings: [1],
    objectives: [1],
    terms: [1],
    meshDescriptors: [1],
    sessionType: 1,
    sessionDescription: 1
  });
  visit('/courses/1/sessions/1/publicationcheck');
  andThen(function() {
    assert.equal(currentPath(), 'course.session.publicationCheck');
    var items = find('.session-publication-check .detail-content table tbody td');
    assert.equal(getElementText(items.eq(0)), getText('session 0'));
    assert.equal(getElementText(items.eq(1)), getText('Yes (1)'));
    assert.equal(getElementText(items.eq(2)), getText('Yes (1)'));
    assert.equal(getElementText(items.eq(3)), getText('Yes (1)'));
    assert.equal(getElementText(items.eq(4)), getText('Yes (1)'));
  });
});

test('empty session count', function(assert) {
  //create 2 bucause the second one is empty
  server.createList('session', 2, {
    course: 1
  });
  visit('/courses/1/sessions/2/publicationcheck');
  andThen(function() {
    assert.equal(currentPath(), 'course.session.publicationCheck');
    var items = find('.session-publication-check .detail-content table tbody td');
    assert.equal(getElementText(items.eq(0)), getText('session 1'));
    assert.equal(getElementText(items.eq(1)), getText('No'));
    assert.equal(getElementText(items.eq(2)), getText('No'));
    assert.equal(getElementText(items.eq(3)), getText('No'));
    assert.equal(getElementText(items.eq(4)), getText('No'));
  });
});

//also test all the session overview fields (Issue #496)
test('check fields', function(assert) {
  server.create('session', {
    course: 1,
    sessionType: 1,
    sessionDescription: 1,
  });
  visit('/courses/1/sessions/1/publicationcheck');

  andThen(function() {
    assert.equal(currentPath(), 'course.session.publicationCheck');
    var container = find('.session-overview');
    assert.equal(getElementText(find('.sessiontype .editable', container)), getText('session type 0'));
    assert.equal(getElementText(find('.sessiondescription .content', container)), getText('session description 0'));
    assert.equal(find('.sessionilmhours', container).length, 0);
  });

});

test('check remove ilm', function(assert) {
  var ilmSession = server.create('ilmSession', {
    session: 1
  });
  server.create('session', {
    course: 1,
    ilmSession: 1
  });
  visit('/courses/1/sessions/1/publicationcheck');

  andThen(function() {
    assert.equal(currentPath(), 'course.session.publicationCheck');
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

  server.create('session', {
    course: 1,
    sessionType: 1,
    description: 'some text',
  });
  visit('/courses/1/sessions/1/publicationcheck');

  andThen(function() {
    assert.equal(currentPath(), 'course.session.publicationCheck');
    var container = find('.session-overview');
    click(find('.independentlearningcontrol .switch-handle', container));
    andThen(function(){
      assert.equal(find('.sessionilmhours', container).length, 1);
      assert.equal(find('.sessionilmduedate', container).length, 1);
      assert.equal(getElementText(find('.sessionilmhours .content', container)), 1);
    });
  });
});

test('change ilm hours', function(assert) {
  var ilmSession = server.create('ilmSession', {
    session: 1
  });
  server.create('session', {
    course: 1,
    ilmSession: 1
  });
  visit('/courses/1/sessions/1/publicationcheck');

  andThen(function() {
    assert.equal(currentPath(), 'course.session.publicationCheck');
    assert.equal(find('.sessionilmhours', container).length, 1);
    var container = find('.session-overview .sessionilmhours');
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
  server.create('session', {
    course: 1,
    ilmSession: 1
  });
  visit('/courses/1/sessions/1/publicationcheck');
  andThen(function() {
    var container = find('.session-overview .sessionilmduedate');
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
  server.create('session', {
    course: 1,
    sessionType: 1
  });
  visit('/courses/1/sessions/1/publicationcheck');
  andThen(function() {
    let container = find('.session-header .title');
    assert.equal(getElementText(container), getText('session 0'));
    click(find('.editable', container));
    andThen(function(){
      let input = find('.editinplace input', container);
      assert.equal(getText(input.val()), getText('session 0'));
      fillIn(input, 'test new title');
      click(find('.done', container));
      andThen(function(){
        assert.equal(getElementText(container), getText('test new title'));
      });
    });
  });
});

test('change type', function(assert) {
  server.create('session', {
    course: 1,
    sessionType: 2
  });
  visit('/courses/1/sessions/1/publicationcheck');
  andThen(function() {
    var container = find('.session-overview');
    assert.equal(getElementText(find('.sessiontype .editable', container)), getText('session type 1'));
    click(find('.sessiontype .editable', container));
    andThen(function(){
      let options = find('.sessiontype select option', container);
      assert.equal(options.length, 2);
      assert.equal(getElementText(options.eq(0)), getText('session type 0'));
      assert.equal(getElementText(options.eq(1)), getText('session type 1'));
      pickOption(find('.sessiontype select', container), 'session type 0', assert);
      click(find('.sessiontype .actions .done', container));
      andThen(function(){
        assert.equal(getElementText(find('.sessiontype .editable', container)), getText('session type 0'));
      });
    });
  });
});

test('change suplimental', function(assert) {
  server.create('session', {
    course: 1,
    sessionType: 2
  });
  visit('/courses/1/sessions/1/publicationcheck');
  andThen(function() {
    var container = find('.session-overview');
    assert.ok(!find('.sessionsupplemental input', container).is(':checked'));
    click(find('.sessionsupplemental .switch', container));
    andThen(function(){
      assert.ok(find('.sessionsupplemental input', container).is(':checked'));
    });
  });
});

test('change special attire', function(assert) {
  server.create('session', {
    course: 1,
    sessionType: 2
  });
  visit('/courses/1/sessions/1/publicationcheck');
  andThen(function() {
    var container = find('.session-overview');
    assert.ok(!find('.sessionspecialattire .switch input', container).is(':checked'));
    click(find('.sessionspecialattire .switch', container));
    andThen(function(){
      assert.ok(find('.sessionspecialattire .switch input', container).is(':checked'));
    });
  });
});

test('change special equipment', function(assert) {
  server.create('session', {
    course: 1,
    sessionType: 2
  });
  visit('/courses/1/sessions/1/publicationcheck');
  andThen(function() {
    var container = find('.session-overview');
    assert.ok(!find('.sessionspecialequipment .switch input', container).is(':checked'));
    click(find('.sessionspecialequipment .switch', container));
    andThen(function(){
      assert.ok(find('.sessionspecialequipment .switch input', container).is(':checked'));
    });
  });
});

test('change description', function(assert) {
  server.create('session', {
    course: 1,
    sessionType: 1,
    sessionDescription: 1
  });
  visit('/courses/1/sessions/1/publicationcheck');
  andThen(function() {
    let description = getText('session description 0');
    let container = find('.session-overview .sessiondescription');
    assert.equal(getElementText(find('.content', container)), description);
    click(find('.editable .clickable', container));
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
  server.create('session', {
    course: 1,
    sessionType: 1
  });
  visit('/courses/1/sessions/1/publicationcheck');
  andThen(function() {
    let container = find('.session-overview .sessiondescription');
    assert.equal(getElementText(container), getText('Description: Click to edit'));
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
          assert.equal(getElementText(container), getText('Description: test new description'));
        });
      }, 100);
    });
  });
});
