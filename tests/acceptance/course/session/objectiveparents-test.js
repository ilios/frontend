import Ember from 'ember';
import {
  module,
  test
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';
import {c as testgroup} from 'ilios/tests/helpers/test-groups';

var application;
var url = '/courses/1/sessions/1';
var fixtures = {};
module('Acceptance: Session - Objective Parents' + testgroup, {
  beforeEach: function() {
    application = startApp();
    authenticateSession();
    server.create('user', {id: 4136});
    server.create('school');
    server.create('sessionType');
    fixtures.parentObjectives = [];
    fixtures.parentObjectives.pushObject(server.create('objective', {
        children: [4,5],
        courses: [1]
    }));
    fixtures.parentObjectives.pushObject(server.create('objective', {
        courses: [1],
        children: [4]
    }));
    fixtures.parentObjectives.pushObject(server.create('objective', {
        courses: [1],
    }));
    fixtures.sessionObjectives = [];
    fixtures.sessionObjectives.pushObject(server.create('objective', {
      sessions: [1],
      parents: [1,2]
    }));
    fixtures.sessionObjectives.pushObject(server.create('objective', {
      sessions: [1],
      parents: [1]
    }));
    fixtures.sessionObjectives.pushObject(server.create('objective', {
      sessions: [1],
    }));
    fixtures.course = server.create('course', {
      year: 2013,
      school: 1,
      objectives: [1,2,3],
    });
    fixtures.session = server.create('session', {
      course: 1,
      objectives: [4,5,6]
    });
  },

  afterEach: function() {
    Ember.run(application, 'destroy');
  }
});

test('list session objectives', function(assert) {
  assert.expect(11);
  visit(url);
  andThen(function() {
    let tds = find('.session-objective-list tbody tr:eq(0) td');
    assert.equal(tds.length, 3);
    click('a', tds.eq(1));
    andThen(function() {
      assert.equal(getElementText(find('.detail-specific-title')), 'SelectParentObjectives');
      let objectiveManager = find('.objective-manager').eq(0);
      let objective = fixtures.sessionObjectives[0];
      assert.equal(getElementText(find('.objectivetitle', objectiveManager)), getText(objective.title));
      let expectedCourseTitle = fixtures.course.title;
      let parentPicker = find('.parent-picker', objectiveManager).eq(0);
      assert.equal(getElementText(find('h5', parentPicker)), getText(expectedCourseTitle));
      //every course objective in the list
      let ul = find('ul', parentPicker).eq(0);
      let items = find('li', ul);
      assert.equal(items.length, fixtures.course.objectives.length);
      for(let i = 0; i < fixtures.course.objectives.length; i++){
        let li = items.eq(i);
        assert.equal(getElementText(li), getText(fixtures.parentObjectives[fixtures.course.objectives[i] - 1].title));
        if(objective.parents.indexOf(fixtures.course.objectives[i]) !== -1){
          assert.ok($(li).hasClass('selected'));
        } else {
          assert.ok(!$(li).hasClass('selected'));
        }
      }
    });
  });
});

test('change session objective parent', function(assert) {
  assert.expect(3);
  visit(url);
  andThen(function() {
    click('.session-objective-list tbody tr:eq(0) td:eq(1) a');
    andThen(function() {
      let objectiveManager = find('.objective-manager').eq(0);
      let parentPicker = find('.parent-picker', objectiveManager).eq(0);
      click('li:eq(0)', parentPicker);
      click('li:eq(2)', parentPicker);
      andThen(function(){
        assert.ok(find('li:eq(1)', parentPicker).hasClass('selected'));
        assert.ok(find('li:eq(2)', parentPicker).hasClass('selected'));
        assert.ok(!find('li:eq(0)', parentPicker).hasClass('selected'));
      });
    });
  });
});

test('deselect all parents for session objective', function(assert) {
  assert.expect(3);
  visit(url);
  andThen(function() {
    click('.session-objective-list tbody tr:eq(0) td:eq(1) a');
    andThen(function() {
      let objectiveManager = find('.objective-manager').eq(0);
      let parentPicker = find('.parent-picker', objectiveManager).eq(0);
      click('li:eq(1)', parentPicker);
      click('li:eq(0)', parentPicker);
      andThen(function(){
        for(let i = 0; i < 3; i++){
          let item = find('li', parentPicker).eq(i);
          assert.ok(!item.hasClass('selected'));
        }
      });

    });
  });
});

test('multiple parents for session objective', function(assert) {
  assert.expect(3);
  visit(url);
  andThen(function() {
    click('.session-objective-list tbody tr:eq(1) td:eq(1) a');
    andThen(function() {
      let objectiveManager = find('.objective-manager').eq(0);
      let parentPicker = find('.parent-picker', objectiveManager).eq(0);
      click('li:eq(1)', parentPicker);
      andThen(function(){
        assert.ok(find('li:eq(0)', parentPicker).hasClass('selected'));
        assert.ok(find('li:eq(1)', parentPicker).hasClass('selected'));
        assert.ok(!find('li:eq(2)', parentPicker).hasClass('selected'));
      });
    });
  });
});

test('save changes', function(assert) {
  assert.expect(1);
  visit(url);
  andThen(function() {
    click('.session-objective-list tbody tr:eq(1) td:eq(1) a');
    click('.objective-manager:eq(0) .parent-picker:eq(0) li:eq(0)');
    click('.objective-manager:eq(0) .parent-picker:eq(0) li:eq(1)');
    click('.detail-objectives:eq(0) button.bigadd');
    andThen(function(){
      let td = find('.session-objective-list tbody tr:eq(1) td:eq(1)');
      assert.equal(getElementText(td), getText(
        fixtures.parentObjectives[1].title
      ));
    });
  });

});

test('cancel changes', function(assert) {
  assert.expect(1);
  visit(url);
  andThen(function() {
    click('.session-objective-list tbody tr:eq(1) td:eq(1) a');
    click('.objective-manager:eq(0) .parent-picker:eq(0) li:eq(1)');
    click('.objective-manager:eq(0) .parent-picker:eq(0) li:eq(0)');
    click('.detail-objectives:eq(0) button.bigcancel');
  });
  andThen(function(){
    let td = find('.session-objective-list tbody tr:eq(1) td:eq(1)');
    assert.equal(getElementText(td), getText(
      fixtures.parentObjectives[0].title
    ));
  });
});
