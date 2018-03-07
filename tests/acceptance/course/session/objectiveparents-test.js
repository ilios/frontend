import destroyApp from '../../../helpers/destroy-app';
import {
  module,
  test
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';

var application;
var url = '/courses/1/sessions/1?sessionObjectiveDetails=true';
var fixtures = {};

module('Acceptance: Session - Objective Parents', function(hooks) {
  hooks.beforeEach(function() {
    application = startApp();
    setupAuthentication(application);
    server.create('school');
    server.create('sessionType');
    fixtures.parentObjectives = [];
    fixtures.parentObjectives.pushObject(server.createList('objective', 3));
    fixtures.sessionObjectives = [];
    fixtures.sessionObjectives.pushObject(server.create('objective', {
      parentIds: [1,2]
    }));
    fixtures.sessionObjectives.pushObject(server.create('objective', {
      parentIds: [1]
    }));
    fixtures.sessionObjectives.pushObject(server.create('objective'));
    fixtures.course = server.create('course', {
      year: 2013,
      schoolId: 1,
      objectiveIds: [1, 2, 3],
    });
    fixtures.session = server.create('session', {
      courseId: 1,
      objectiveIds: [4, 5, 6]
    });
  });

  hooks.afterEach(function() {
    destroyApp(application);
  });

  test('list session objectives', async function(assert) {
    assert.expect(11);
    await visit(url);
    let tds = find('.session-objective-list tbody tr:eq(0) td');
    assert.equal(tds.length, 4);
    await click('.link', tds.eq(1));
    assert.equal(getElementText(find('.specific-title')), 'SelectParentObjectives');
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

    assert.equal(getElementText(items.eq(0)), getText('objective 0'));
    assert.ok(find(items.eq(0)).hasClass('selected'));

    assert.equal(getElementText(items.eq(1)), getText('objective 1'));
    assert.ok(find(items.eq(1)).hasClass('selected'));

    assert.equal(getElementText(items.eq(2)), getText('objective 2'));
    assert.notOk(find(items.eq(2)).hasClass('selected'));
  });

  test('change session objective parent', async function(assert) {
    assert.expect(3);
    await visit(url);
    await click('.session-objective-list tbody tr:eq(0) td:eq(1) .link');
    let objectiveManager = find('.objective-manager').eq(0);
    let parentPicker = find('.parent-picker', objectiveManager).eq(0);
    await click('li:eq(0)', parentPicker);
    await click('li:eq(2)', parentPicker);
    assert.ok(find('li:eq(1)', parentPicker).hasClass('selected'));
    assert.ok(find('li:eq(2)', parentPicker).hasClass('selected'));
    assert.ok(!find('li:eq(0)', parentPicker).hasClass('selected'));
  });

  test('deselect all parents for session objective', async function(assert) {
    assert.expect(3);
    await visit(url);
    await click('.session-objective-list tbody tr:eq(0) td:eq(1) .link');
    let objectiveManager = find('.objective-manager').eq(0);
    let parentPicker = find('.parent-picker', objectiveManager).eq(0);
    await click('li:eq(1)', parentPicker);
    await click('li:eq(0)', parentPicker);
    for(let i = 0; i < 3; i++){
      let item = find('li', parentPicker).eq(i);
      assert.ok(!item.hasClass('selected'));
    }
  });

  test('multiple parents for session objective', async function(assert) {
    assert.expect(3);
    await visit(url);
    await click('.session-objective-list tbody tr:eq(1) td:eq(1) .link');
    let objectiveManager = find('.objective-manager').eq(0);
    let parentPicker = find('.parent-picker', objectiveManager).eq(0);
    await click('li:eq(1)', parentPicker);
    assert.ok(find('li:eq(0)', parentPicker).hasClass('selected'));
    assert.ok(find('li:eq(1)', parentPicker).hasClass('selected'));
    assert.ok(!find('li:eq(2)', parentPicker).hasClass('selected'));
  });

  test('save changes', async function(assert) {
    assert.expect(1);
    await visit(url);
    await click('.session-objective-list tbody tr:eq(1) td:eq(1) .link');
    await click('.objective-manager:eq(0) .parent-picker:eq(0) li:eq(0)');
    await click('.objective-manager:eq(0) .parent-picker:eq(0) li:eq(1)');
    await click('.detail-objectives:eq(0) button.bigadd');
    let td = find('.session-objective-list tbody tr:eq(1) td:eq(1)');
    assert.equal(getElementText(td), getText('objective 1'));
  });

  test('cancel changes', async function(assert) {
    assert.expect(1);
    await visit(url);
    await click('.session-objective-list tbody tr:eq(1) td:eq(1) .link');
    await click('.objective-manager:eq(0) .parent-picker:eq(0) li:eq(1)');
    await click('.objective-manager:eq(0) .parent-picker:eq(0) li:eq(0)');
    await click('.detail-objectives:eq(0) button.bigcancel');
    let td = find('.session-objective-list tbody tr:eq(1) td:eq(1)');
    assert.equal(getElementText(td), getText('objective 0'));
  });
});
