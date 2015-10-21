import Ember from 'ember';
import {
  module,
  test
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';

var application;
var fixtures = {};
var url = '/courses/1/sessions/1';
module('Acceptance: Session - Objective Create', {
  beforeEach: function() {
    application = startApp();
    authenticateSession();
    server.create('user', {id: 4136});
    server.create('school');
    server.create('course');
    server.create('sessionType');
    fixtures.objective = server.create('objective', {
      sessions: [1],
    });
    fixtures.session = server.create('session', {
      course: 1,
      objectives: [1]
    });
  },

  afterEach: function() {
    Ember.run(application, 'destroy');
  }
});

test('save new objective', function(assert) {
  assert.expect(8);
  visit(url);
  var newObjectiveTitle = 'Test junk 123';
  andThen(function() {
    let objectiveRows = find('.detail-objectives .session-objective-list tbody tr');
    assert.equal(objectiveRows.length, fixtures.session.objectives.length);
    click('.detail-objectives .detail-actions button');
    //wait for the editor to load
    Ember.run.later(()=>{
      find('.detail-objectives .newobjective .froala-box').editable('setHTML', newObjectiveTitle);
      click('.detail-objectives .newobjective button.done');
      andThen(function(){
        let objectiveRows = find('.detail-objectives .session-objective-list tbody tr');
        assert.equal(objectiveRows.length, fixtures.session.objectives.length + 1);
        let tds = find('td', objectiveRows.eq(0));
        assert.equal(getElementText(tds.eq(0)), getText(fixtures.objective.title));
        assert.equal(getElementText(tds.eq(1)), getText('Add New'));
        assert.equal(getElementText(tds.eq(2)), getText('Add New'));
        tds = find('td', objectiveRows.eq(1));
        assert.equal(getElementText(tds.eq(0)), getText(newObjectiveTitle));
        assert.equal(getElementText(tds.eq(1)), getText('Add New'));
        assert.equal(getElementText(tds.eq(2)), getText('Add New'));
      });
    }, 100);
  });
  
});

test('cancel new objective', function(assert) {
  assert.expect(5);
  visit(url);
  andThen(function() {
    let objectiveRows = find('.detail-objectives .session-objective-list tbody tr');
    assert.equal(objectiveRows.length, fixtures.session.objectives.length);
    click('.detail-objectives .detail-actions button');
    click('.detail-objectives .newobjective button.cancel');
  });
  andThen(function(){
    let objectiveRows = find('.detail-objectives .session-objective-list tbody tr');
    assert.equal(objectiveRows.length, fixtures.session.objectives.length);
    let tds = find('td', objectiveRows.eq(0));
    assert.equal(getElementText(tds.eq(0)), getText(fixtures.objective.title));
    assert.equal(getElementText(tds.eq(1)), getText('Add New'));
    assert.equal(getElementText(tds.eq(2)), getText('Add New'));
  });
});
