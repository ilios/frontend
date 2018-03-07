import { run } from '@ember/runloop';
import destroyApp from '../../../helpers/destroy-app';
import {
  module,
  test
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';
import { settled, click, visit } from '@ember/test-helpers';

var application;
var fixtures = {};
var url = '/courses/1/sessions/1?sessionObjectiveDetails=true';

module('Acceptance: Session - Objective Create', function(hooks) {
  hooks.beforeEach(function() {
    application = startApp();
    setupAuthentication(application);
    this.server.create('school');
    this.server.create('course');
    this.server.create('sessionType');
    fixtures.objective = this.server.create('objective');
    fixtures.session = this.server.create('session', {
      courseId: 1,
      objectiveIds: [1]
    });
  });

  hooks.afterEach(function() {
    destroyApp(application);
  });

  test('save new objective', async function(assert) {
    assert.expect(8);
    await visit(url);
    var newObjectiveTitle = 'Test junk 123';
    let objectiveRows = find('.detail-objectives .session-objective-list tbody tr');
    assert.equal(objectiveRows.length, fixtures.session.objectives.length, 'correct number ob initial objectives');
    await click('.detail-objectives .detail-objectives-actions button');
    find('.detail-objectives .new-objective .fr-box').froalaEditor('html.set', newObjectiveTitle);
    find('.detail-objectives .new-objective .fr-box').froalaEditor('events.trigger', 'contentChanged');
    await click('.detail-objectives .new-objective button.done');
    objectiveRows = find('.detail-objectives .session-objective-list tbody tr');
    assert.equal(objectiveRows.length, fixtures.session.objectives.length + 1);
    let tds = find('td', objectiveRows.eq(0));
    assert.equal(getElementText(tds.eq(0)), getText(fixtures.objective.title));
    assert.equal(getElementText(tds.eq(1)), getText('Add New'));
    assert.equal(getElementText(tds.eq(2)), getText('Add New'));
    tds = find('td', objectiveRows.eq(1));
    assert.equal(getElementText(tds.eq(0)), getText(newObjectiveTitle));
    assert.equal(getElementText(tds.eq(1)), getText('Add New'));
    assert.equal(getElementText(tds.eq(2)), getText('Add New'));

    await settled();
  });

  test('cancel new objective', async function(assert) {
    assert.expect(5);
    await visit(url);
    let objectiveRows = find('.detail-objectives .session-objective-list tbody tr');
    assert.equal(objectiveRows.length, fixtures.session.objectives.length);
    await click('.detail-objectives .detail-objectives-actions button');
    await click('.detail-objectives .new-objective button.cancel');
    objectiveRows = find('.detail-objectives .session-objective-list tbody tr');
    assert.equal(objectiveRows.length, fixtures.session.objectives.length);
    let tds = find('td', objectiveRows.eq(0));
    assert.equal(getElementText(tds.eq(0)), getText(fixtures.objective.title));
    assert.equal(getElementText(tds.eq(1)), getText('Add New'));
    assert.equal(getElementText(tds.eq(2)), getText('Add New'));
  });

  test('empty objective title can not be created', async function(assert) {
    assert.expect(3);
    const container = '.detail-objectives:eq(0)';
    const expandNewObjective = `${container} .detail-objectives-actions button`;
    const newObjective = `${container} .new-objective`;
    const editor = `${newObjective} .fr-box`;
    const save = `${newObjective} .done`;
    const errorMessage = `${newObjective} .validation-error-message`;
    await visit(url);
    await click(expandNewObjective);

    let editorContents = find(editor).data('froala.editor').$el.text();
    assert.equal(getText(editorContents), '');

    find(editor).froalaEditor('html.set', '<p>&nbsp</p><div></div><span>  </span>');
    find(editor).froalaEditor('events.trigger', 'contentChanged');
    run.later(()=>{
      assert.equal(getElementText(errorMessage), getText('This field cannot be blank'));
      assert.ok(find(save).is(':disabled'));
    });

    await settled();
  });
});
