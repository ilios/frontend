import { later } from '@ember/runloop';
import destroyApp from '../../../helpers/destroy-app';
import {
  module,
  test
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';
import wait from 'ember-test-helpers/wait';

var application;
var url = '/programs/1/programyears/1?pyObjectiveDetails=true';
module('Acceptance: Program Year - Objectives', {
  beforeEach: function() {
    application = startApp();
    setupAuthentication(application);
    server.create('school');
    server.create('program', {
      schoolId: 1,
    });
    server.create('programYear', {
      programId: 1,
    });
    server.create('cohort', {
      programYearId: 1
    });
    server.create('competency', {
      schoolId: 1,
    });
    server.create('competency', {
      parentId: 1,
      schoolId: 1,
      programYearIds: [1],
    });
    server.create('competency', {
      parentId: 1,
      schoolId: 1,
      programYearIds: [1],
    });
    server.create('competency', {
      schoolId: 1,
      programYearIds: [1],
    });
    server.create('competency', {
      schoolId: 1,
      programYearIds: [1],
    });
    server.createList('meshDescriptor', 4);

    server.create('objective', {
      programYearIds: [1],
      competencyId: 2,
      meshDescriptorIds: [1, 2]
    });
    server.create('objective', {
      programYearIds: [1],
      competencyId: 4
    });
    server.create('objective', {
      programYearIds: [1]
    });
  },

  afterEach: function() {
    destroyApp(application);
  }
});

test('list', async function(assert) {
  await visit(url);
  let objectiveRows = find('.programyear-objective-list tbody tr');
  assert.equal(objectiveRows.length, 3);
  assert.equal(getElementText(find('td:eq(0)', objectiveRows.eq(0))), getText('objective 0'));
  assert.equal(getElementText(find('td:eq(1)', objectiveRows.eq(0))), getText('competency 1 (competency 0)'));
  assert.equal(getElementText(find('td:eq(2)', objectiveRows.eq(0))), getText('descriptor 0 descriptor 1'));

  assert.equal(getElementText(find('td:eq(0)', objectiveRows.eq(1))), getText('objective 1'));
  assert.equal(getElementText(find('td:eq(1)', objectiveRows.eq(1))), getText('competency 3'));
  assert.equal(getElementText(find('td:eq(2)', objectiveRows.eq(1))), getText('Add New'));

  assert.equal(getElementText(find('td:eq(0)', objectiveRows.eq(2))), getText('objective 2'));
  assert.equal(getElementText(find('td:eq(1)', objectiveRows.eq(2))), getText('Add New'));
  assert.equal(getElementText(find('td:eq(2)', objectiveRows.eq(2))), getText('Add New'));
});

test('manage terms', async function(assert) {
  assert.expect(21);
  await visit(url);
  let detailObjectives = find('.detail-objectives').eq(0);
  await click('.programyear-objective-list tbody tr:eq(0) td:eq(2) .link', detailObjectives);
  assert.equal(getElementText(find('.specific-title', detailObjectives)), 'SelectMeSHDescriptorsforObjective');

  let meshManager = find('.mesh-manager', detailObjectives).eq(0);
  let removableItems = find('.selected-terms li', meshManager);
  assert.equal(removableItems.length, 2);
  assert.equal(getElementText(find('.term-title', removableItems.eq(0)).eq(0)), getText('descriptor 0'));
  assert.equal(getElementText(find('.term-title', removableItems.eq(1)).eq(0)), getText('descriptor 1'));

  let searchBox = find('.search-box', meshManager);
  assert.equal(searchBox.length, 1);
  searchBox = searchBox.eq(0);
  let searchBoxInput = find('input', searchBox);
  assert.equal(searchBoxInput.attr('placeholder'), 'Search MeSH');
  await fillIn(searchBoxInput, 'descriptor');
  await click('span.search-icon', searchBox);
  let searchResults = find('.mesh-search-results li', meshManager);
  assert.equal(searchResults.length, 4);

  assert.equal(getElementText(find('.descriptor-name', searchResults[0]).eq(0)), getText('descriptor 0'));
  assert.equal(getElementText(find('.descriptor-name', searchResults[1]).eq(0)), getText('descriptor 1'));
  assert.equal(getElementText(find('.descriptor-name', searchResults[2]).eq(0)), getText('descriptor 2'));
  assert.equal(getElementText(find('.descriptor-name', searchResults[3]).eq(0)), getText('descriptor 3'));
  assert.ok(find(searchResults[0]).hasClass('disabled'));
  assert.ok(find(searchResults[1]).hasClass('disabled'));
  assert.ok(!find(searchResults[2]).hasClass('disabled'));
  assert.ok(!find(searchResults[3]).hasClass('disabled'));
  await click('.selected-terms li:eq(0)', meshManager);
  assert.ok(!find('.mesh-search-results li:eq(0)', meshManager).hasClass('disabled'));
  await click(searchResults[2]);
  assert.ok(find('.mesh-search-results li:eq(1)', meshManager).hasClass('disabled'));
  assert.ok(find('.mesh-search-results li:eq(2)', meshManager).hasClass('disabled'));

  removableItems = find('.selected-terms li', meshManager);
  assert.equal(removableItems.length, 2);
  assert.equal(
    getElementText(find('.term-title', removableItems.eq(0)).eq(0)),
    getText('descriptor 1')
  );
  assert.equal(
    getElementText(find('.term-title', removableItems.eq(1)).eq(0)),
    getText('descriptor 2')
  );
});

test('save terms', async function(assert) {
  assert.expect(1);
  await visit(url);
  let detailObjectives = find('.detail-objectives').eq(0);
  await click('.programyear-objective-list tbody tr:eq(0) td:eq(2) .link', detailObjectives);
  let meshManager = find('.mesh-manager', detailObjectives).eq(0);
  let searchBoxInput = find('.search-box input', meshManager);
  await fillIn(searchBoxInput, 'descriptor');
  await click('span.search-icon', meshManager);
  let searchResults = find('.mesh-search-results li', meshManager);
  await click('.selected-terms li:eq(0)', meshManager);
  await click(searchResults[2]);
  await click('button.bigadd', detailObjectives);
  let tds = find('.programyear-objective-list tbody tr:eq(0) td');
  assert.equal(getElementText(tds.eq(2)), getText('descriptor 1 descriptor 2'));
});

test('cancel term changes', async function(assert) {
  assert.expect(1);
  await visit(url);
  let detailObjectives = find('.detail-objectives').eq(0);
  await click('.programyear-objective-list tbody tr:eq(0) td:eq(2) .link', detailObjectives);
  let meshManager = find('.mesh-manager', detailObjectives).eq(0);
  let searchBoxInput = find('.search-box input', meshManager);
  await fillIn(searchBoxInput, 'descriptor');
  await click('span.search-icon', meshManager);
  let searchResults = find('.mesh-search-results li', meshManager);
  await click('.selected-terms li:eq(0)', meshManager);
  await click(searchResults[2]);
  await click(searchResults[3]);
  await click('button.bigcancel', detailObjectives);
  let tds = find('.programyear-objective-list tbody tr:eq(0) td');
  assert.equal(getElementText(tds.eq(2)), getText('descriptor 0 descriptor 1'));
});

test('manage competencies', async function(assert) {
  assert.expect(14);
  await visit(url);
  let tds = find('.programyear-objective-list tbody tr:eq(0) td');
  assert.equal(tds.length, 3);
  await click('.link', tds.eq(1));
  assert.equal(getElementText(find('.specific-title')), 'SelectParentCompetencyforObjective');
  let objectiveManager = find('.objective-manage-competency').eq(0);
  assert.equal(getElementText(find('.objectivetitle', objectiveManager)), getText('objective 0'));
  assert.equal(getElementText(find('.parent-picker', objectiveManager)), getText('competency0 competency1 competency2 competency3 competency4'));
  let items = find('.parent-picker .clickable');
  assert.equal(items.length, 4);
  assert.ok(find('.parent-picker h5:eq(0)').hasClass('selected'));
  assert.ok(find(items[0]).hasClass('selected'));
  assert.ok(!find(items[1]).hasClass('selected'));
  assert.ok(!find('.parent-picker h5:eq(1)').hasClass('selected'));
  assert.ok(!find('.parent-picker h5:eq(2)').hasClass('selected'));

  await click('.parent-picker .clickable:eq(2)', objectiveManager);
  items = find('.parent-picker .clickable');
  assert.ok(!find(items[0]).hasClass('selected'));
  assert.ok(!find(items[1]).hasClass('selected'));
  assert.ok(find(items[2]).hasClass('selected'));
  assert.ok(!find(items[3]).hasClass('selected'));
});

test('save competency', async function(assert) {
  assert.expect(1);
  await visit(url);
  await click('.programyear-objective-list tbody tr:eq(0) td:eq(1) .link');
  let objectiveManager = find('.objective-manage-competency').eq(0);
  await click('.parent-picker .clickable:eq(1)', objectiveManager);
  await click('.detail-objectives button.bigadd');
  assert.equal(getElementText(find('.programyear-objective-list tbody tr td:eq(1)')), getText('competency 2 (competency 0)'));
});

test('save no competency', async function(assert) {
  assert.expect(1);
  await visit(url);
  await click('.programyear-objective-list tbody tr:eq(0) td:eq(1) .link');
  let objectiveManager = find('.objective-manage-competency').eq(0);
  await click('.parent-picker .clickable:eq(0)', objectiveManager);
  await click('.detail-objectives button.bigadd');
  assert.equal(getElementText(find('.programyear-objective-list tbody tr td:eq(1)')), getText('Add New'));
});

test('cancel competency change', async function(assert) {
  assert.expect(1);
  await visit(url);
  await click('.programyear-objective-list tbody tr:eq(0) td:eq(1) .link');
  let objectiveManager = find('.objective-manage-competency').eq(0);
  await click('.parent-picker li:eq(1)', objectiveManager);
  await click('.detail-objectives button.bigcancel');
  assert.equal(getElementText(find('.programyear-objective-list tbody tr td:eq(1)')), getText('competency 1 (competency 0)'));
});

test('cancel remove competency change', async function(assert) {
  assert.expect(1);
  await visit(url);
  await click('.programyear-objective-list tbody tr:eq(0) td:eq(1) .link');
  let objectiveManager = find('.objective-manage-competency').eq(0);
  await click('.parent-picker li:eq(0)', objectiveManager);
  await click('.detail-objectives button.bigcancel');
  assert.equal(getElementText(find('.programyear-objective-list tbody tr td:eq(1)')), getText('competency 1 (competency 0)'));
});

test('add competency', async function(assert) {
  assert.expect(1);
  await visit(url);
  await click('.programyear-objective-list tbody tr:eq(2) td:eq(1) button');
  let objectiveManager = find('.objective-manage-competency').eq(0);
  await click('.parent-picker .clickable:eq(1)', objectiveManager);
  await click('.detail-objectives button.bigadd');
  assert.equal(getElementText(find('.programyear-objective-list tbody tr:eq(2) td:eq(1)')), getText('competency 2 (competency 0)'));
});

test('empty objective title can not be saved', async function(assert) {
  assert.expect(4);
  await visit(url);
  const container = '.programyear-objective-list';
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
  later(()=>{
    assert.equal(getElementText(errorMessage), getText('This field cannot be blank'));
    assert.ok(find(save).is(':disabled'));
  }, 100);

  await wait();
});
