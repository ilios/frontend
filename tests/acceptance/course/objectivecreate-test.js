import { run } from '@ember/runloop';
import destroyApp from '../../helpers/destroy-app';
import {
  module,
  test
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';
import wait from 'ember-test-helpers/wait';
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
    fixtures.objective = server.create('objective');
    fixtures.course = server.create('course', {
      year: 2013,
      schoolId: 1,
      objectiveIds: [1]
    });
  },

  afterEach: function() {
    destroyApp(application);
  }
});

test('save new objective', async function(assert) {
  assert.expect(8);
  await visit(url);
  var newObjectiveTitle = 'Test junk 123';
  let objectiveRows = find('.detail-objectives .course-objective-list tbody tr');
  assert.equal(objectiveRows.length, fixtures.course.objectives.length);
  await click('.detail-objectives .detail-objectives-actions button');
  find('.detail-objectives .newobjective .fr-box').froalaEditor('html.set', newObjectiveTitle);
  find('.detail-objectives .newobjective .fr-box').froalaEditor('events.trigger', 'contentChanged');
  await click('.detail-objectives .newobjective button.done');
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

  await wait();
});

test('cancel new objective', async function(assert) {
  assert.expect(5);
  await visit(url);
  let objectiveRows = find('.detail-objectives .course-objective-list tbody tr');
  assert.equal(objectiveRows.length, fixtures.course.objectives.length);
  await click('.detail-objectives .detail-objectives-actions button');
  await click('.detail-objectives .newobjective button.cancel');
  objectiveRows = find('.detail-objectives .course-objective-list tbody tr');
  assert.equal(objectiveRows.length, fixtures.course.objectives.length);
  let tds = find('td', objectiveRows.eq(0));
  assert.equal(getElementText(tds.eq(0)), getText(fixtures.objective.title));
  assert.equal(getElementText(tds.eq(1)), getText('Add New'));
  assert.equal(getElementText(tds.eq(2)), getText('Add New'));
});

test('empty objective title can not be created', async function(assert) {
  assert.expect(3);
  const container = '.detail-objectives:eq(0)';
  const expandNewObjective = `${container} .detail-objectives-actions button`;
  const newObjective = `${container} .newobjective`;
  const editor = `${newObjective} .fr-box`;
  const save = `${newObjective} .done`;
  const errorMessage = `${newObjective} .validation-error-message`;
  await visit(url);
  await click(expandNewObjective);

  let editorContents = find(editor).data('froala.editor').$el.text();
  assert.equal(getText(editorContents), '');
  find(editor).froalaEditor('html.set', '<p>&nbsp</p><div></div><span>  </span>');
  find(editor).froalaEditor('events.trigger', 'contentChanged');
  run.later(() => {
    assert.equal(getElementText(errorMessage), getText('This field cannot be blank'));
    assert.ok(find(save).is(':disabled'));
  });

  await wait();
});
