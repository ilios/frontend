import { run } from '@ember/runloop';
import destroyApp from '../../../helpers/destroy-app';
import {
  module,
  test
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';
import { settled } from '@ember/test-helpers';

var application;
var fixtures = {};
var url = '/courses/1/sessions/1?sessionObjectiveDetails=true';

module('Acceptance: Session - Objective List', function(hooks) {
  hooks.beforeEach(function() {
    application = startApp();
    setupAuthentication(application);
    server.create('school');
    server.create('course');
    server.create('sessionType');
  });

  hooks.afterEach(function() {
    destroyApp(application);
  });

  test('list objectives', async function(assert) {
    assert.expect(40);
    server.createList('objective', 2);
    server.createList('meshDescriptor', 6);
    let sessionObjectives = [];
    sessionObjectives.pushObject(server.create('objective', {
      parentIds: [1],
      meshDescriptorIds: [1]
    }));
    sessionObjectives.pushObject(server.create('objective', {
      parentIds: [1, 2],
      meshDescriptorIds: [1, 2]
    }));
    sessionObjectives.pushObjects(server.createList('objective', 11));
    server.create('session', {
      courseId: 1,
      objectiveIds: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
    });
    await visit(url);
    let objectiveRows = find('.session-objective-list tbody tr');
    assert.equal(objectiveRows.length, sessionObjectives.length);

    for (let i = 0; i < sessionObjectives.length; i++) {
      let tds = find('td', objectiveRows.eq(i));
      let objective = sessionObjectives[i];

      let parentTitle = '';
      if (objective.parents.length) {
        parentTitle = objective.parents.models.mapBy('title').join('');
      } else {
        parentTitle = 'Add New';
      }
      let meshTitle;
      if (objective.meshDescriptors.length) {
        meshTitle = objective.meshDescriptors.models.mapBy('name').join('');
      } else {
        meshTitle = 'Add New';
      }

      assert.equal(getElementText(tds.eq(0)), getText(objective.title));
      assert.equal(getElementText(tds.eq(1)), getText(parentTitle));
      assert.equal(getElementText(tds.eq(2)), getText(meshTitle));
    }
  });

  test('long objective', async function(assert) {
    assert.expect(3);
    var longTitle = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam placerat tempor neque ut egestas. In cursus dignissim erat, sed porttitor mauris tincidunt at. Nunc et tortor in purus facilisis molestie. Phasellus in ligula nisi. Nam nec mi in urna mollis pharetra. Suspendisse in nibh ex. Curabitur maximus diam in condimentum pulvinar. Phasellus sit amet metus interdum, molestie turpis vel, bibendum eros. In fermentum elit in odio cursus cursus. Nullam ipsum ipsum, fringilla a efficitur non, vehicula vitae enim. Duis ultrices vitae neque in pulvinar. Nulla molestie vitae quam eu faucibus. Vestibulum tempor, tellus in dapibus sagittis, velit purus maximus lectus, quis ullamcorper sem neque quis sem. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Sed commodo risus sed tellus imperdiet, ac suscipit justo scelerisque. Quisque sit amet nulla efficitur, sollicitudin sem in, venenatis mi. Quisque sit amet neque varius, interdum quam id, condimentum ipsum. Quisque tincidunt efficitur diam ut feugiat. Duis vehicula mauris elit, vel vehicula eros commodo rhoncus. Phasellus ac eros vel turpis egestas aliquet. Nam id dolor rutrum, imperdiet purus ac, faucibus nisi. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Nam aliquam leo eget quam varius ultricies. Suspendisse pellentesque varius mi eu luctus. Integer lacinia ornare magna, in egestas quam molestie non.';
    server.create('objective', {
      title: longTitle
    });

    fixtures.session = server.create('session', {
      courseId: 1,
      objectiveIds: [1]
    });
    await visit(url);
    let objectiveRows = find('.session-objective-list tbody tr');
    assert.equal(objectiveRows.length, 1);
    let td = find('.session-objective-list tbody tr:eq(0) td:eq(0)');
    assert.equal(getElementText(td), getText(longTitle.substring(0,200)));
    await click('i:eq(0)', td);
    assert.equal(getElementText(find('.fr-element', td)), getText(longTitle));
  });

  test('edit objective title', async function(assert) {
    assert.expect(3);
    var objective = server.create('objective', {
      courseIds: [1],
    });

    fixtures.session = server.create('session', {
      courseId: 1,
      objectiveIds: [1]
    });
    await visit(url);
    var container = find('.session-objective-list');
    let td = find('tbody tr:eq(0) td:eq(0)', container);
    assert.equal(getElementText(td), getText(objective.title));
    await click('.editable span', td);

    let editor = find('.fr-box', td);
    let editorContents = editor.data('froala.editor').$el.text();
    assert.equal(getText(editorContents), getText(objective.title));

    editor.froalaEditor('html.set', 'new title');
    editor.froalaEditor('events.trigger', 'contentChanged');
    await click(find('.actions .done', td));
    assert.equal(getElementText(find('tbody tr:eq(0) td:eq(0)', container)), getText('new title'));
  });

  test('empty objective title can not be saved', async function(assert) {
    assert.expect(4);
    server.create('objective');

    server.create('session', {
      courseId: 1,
      objectiveIds: [1]
    });
    await visit(url);
    const container = '.session-objective-list';
    const title = `${container} tbody tr:eq(0) td:eq(0)`;
    const edit = `${title} .editable span`;
    const editor = `${title} .fr-box`;
    const initialObjectiveTitle = 'objective 0';
    const save = `${title} .done`;
    const errorMessage = `${title} .validation-error-message`;

    assert.equal(getElementText(title), getText(initialObjectiveTitle));
    await click(edit);
    let editorContents = find(editor).data('froala.editor').$el.text();
    assert.equal(getText(editorContents), getText(initialObjectiveTitle));

    find(editor).froalaEditor('html.set', '<p>&nbsp</p><div></div><span>  </span>');
    find(editor).froalaEditor('events.trigger', 'contentChanged');
    run.later(()=>{
      assert.equal(getElementText(errorMessage), getText('This field cannot be blank'));
      assert.ok(find(save).is(':disabled'));
    }, 100);

    await settled();
  });
});