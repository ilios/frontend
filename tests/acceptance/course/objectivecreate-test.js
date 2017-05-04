import destroyApp from '../../helpers/destroy-app';
import {
  module,
  test
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';
import Ember from 'ember';

var application;
var fixtures = {};
var url = '/courses/1?details=true&courseObjectiveDetails=true';
module('Acceptance: Course - Objective Create', {
  beforeEach: function() {
    application = startApp();
    setupAuthentication(application);
    server.create('school');
    server.create('academicYear', {id: 2013});
    server.createList('program', 2);
    server.createList('programYear', 2);
    server.createList('cohort', 2);
    fixtures.objective = server.create('objective', {
      courses: [1],
    });
    fixtures.course = server.create('course', {
      year: 2013,
      school: 1,
      objectives: [1]
    });
  },

  afterEach: function() {
    destroyApp(application);
  }
});

test('save new objective', function(assert) {
  assert.expect(8);
  visit(url);
  var newObjectiveTitle = 'Test junk 123';
  andThen(function() {
    let objectiveRows = find('.detail-objectives .course-objective-list tbody tr');
    assert.equal(objectiveRows.length, fixtures.course.objectives.length);
    click('.detail-objectives .detail-objectives-actions button');
    //wait for the editor to load
    Ember.run.later(()=>{
      find('.detail-objectives .newobjective .fr-box').froalaEditor('html.set', newObjectiveTitle);
      find('.detail-objectives .newobjective .fr-box').froalaEditor('events.trigger', 'contentChanged');
      Ember.run.later(()=>{
        click('.detail-objectives .newobjective button.done');
        andThen(function(){
          objectiveRows = find('.detail-objectives .course-objective-list tbody tr');
          assert.equal(objectiveRows.length, fixtures.course.objectives.length + 1);
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
    }, 100);
  });

});

test('cancel new objective', function(assert) {
  assert.expect(5);
  visit(url);
  andThen(function() {
    let objectiveRows = find('.detail-objectives .course-objective-list tbody tr');
    assert.equal(objectiveRows.length, fixtures.course.objectives.length);
    click('.detail-objectives .detail-objectives-actions button');
    click('.detail-objectives .newobjective button.cancel');
  });
  andThen(function(){
    let objectiveRows = find('.detail-objectives .course-objective-list tbody tr');
    assert.equal(objectiveRows.length, fixtures.course.objectives.length);
    let tds = find('td', objectiveRows.eq(0));
    assert.equal(getElementText(tds.eq(0)), getText(fixtures.objective.title));
    assert.equal(getElementText(tds.eq(1)), getText('Add New'));
    assert.equal(getElementText(tds.eq(2)), getText('Add New'));
  });
});

test('empty objective title can not be created', function(assert) {
  assert.expect(3);
  const container = '.detail-objectives:eq(0)';
  const expandNewObjective = `${container} .detail-objectives-actions button`;
  const newObjective = `${container} .newobjective`;
  const editor = `${newObjective} .fr-box`;
  const save = `${newObjective} .done`;
  const errorMessage = `${newObjective} .validation-error-message`;
  visit(url);
  click(expandNewObjective);

  andThen(function() {
    //wait for the editor to load
    Ember.run.later(()=>{
      let editorContents = find(editor).data('froala.editor').$el.text();
      assert.equal(getText(editorContents), '');

      find(editor).froalaEditor('html.set', '<p>&nbsp</p><div></div><span>  </span>');
      find(editor).froalaEditor('events.trigger', 'contentChanged');
      Ember.run.later(()=>{
        assert.equal(getElementText(errorMessage), getText('This field cannot be blank'));
        assert.ok(find(save).is(':disabled'));
      }, 100);
    }, 100);
  });
});
