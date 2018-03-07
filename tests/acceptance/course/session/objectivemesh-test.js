import destroyApp from '../../../helpers/destroy-app';
import {
  module,
  test
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';
import { isEmpty } from '@ember/utils';

import { settled, click, fillIn, find, findAll, visit } from '@ember/test-helpers';

var application;
var url = '/courses/1/sessions/1?sessionObjectiveDetails=true';
var fixtures = {};

module('Acceptance: Session - Objective Mesh Descriptors', function(hooks) {
  hooks.beforeEach(function() {
    application = startApp();
    setupAuthentication(application);
    server.create('school');
    server.create('course');
    server.create('sessionType');

    fixtures.meshDescriptors = [];
    fixtures.meshDescriptors.pushObjects(server.createList('meshDescriptor', 7));

    fixtures.sessionObjectives = [];
    fixtures.sessionObjectives.pushObject(server.create('objective', {
      meshDescriptorIds: [1]
    }));
    fixtures.sessionObjectives.pushObject(server.create('objective', {
      meshDescriptorIds: [1,2]
    }));
    fixtures.sessionObjectives.pushObjects(server.createList('objective', 11));
    fixtures.course = server.create('course', {
      year: 2013,
      schoolId: 1
    });
    fixtures.session = server.create('session', {
      courseId: 1,
      objectiveIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]
    });

    //create some extra descriptors that shouldn't be found in search
    server.createList('meshDescriptor', 10, {name: 'nope', annotation: 'nope'});
  });

  hooks.afterEach(function() {
    destroyApp(application);
  });

  test('list terms', async function(assert) {
    assert.expect(1 + fixtures.sessionObjectives.length * 3);
    await visit(url);
    let objectiveRows = find('.session-objective-list tbody tr');
    assert.equal(objectiveRows.length, fixtures.sessionObjectives.length);
    for(let i = 0; i < fixtures.sessionObjectives.length; i++){
      let tds = find('td', objectiveRows.eq(i));
      let objective = fixtures.sessionObjectives[i];
      assert.equal(tds.length, 4);
      let descriptors = objective.meshDescriptors.models.mapBy('name').join('');
      if(isEmpty(descriptors)){
        descriptors = 'Add New';
      }

      assert.equal(getElementText(tds.eq(0)), getText(objective.title));
      assert.equal(getElementText(tds.eq(2)), getText(descriptors));
    }
    await settled();
  });

  test('manage terms', async function(assert) {
    assert.expect(26);
    await visit(url);
    let detailObjectives = find('.detail-objectives').eq(0);
    await click('.session-objective-list tbody tr:eq(1) td:eq(2) .link', detailObjectives);
    assert.equal(getElementText(find('.specific-title', detailObjectives)), 'SelectMeSHDescriptorsforObjective');
    let meshManager = find('.mesh-manager', detailObjectives).eq(0);
    let objective = fixtures.sessionObjectives[1];
    let removableItems = find('.selected-terms li', meshManager);
    assert.equal(removableItems.length, objective.meshDescriptors.length);
    for (let i = 0; i < objective.meshDescriptors.length; i++){
      let meshDescriptorName = find('.term-title', removableItems[i]).eq(0);
      assert.equal(getElementText(meshDescriptorName), getText(fixtures.meshDescriptors[objective.meshDescriptorIds[i] - 1].name));
    }

    let searchBox = find('.search-box', meshManager);
    assert.equal(searchBox.length, 1);
    searchBox = searchBox.eq(0);
    let searchBoxInput = find('input', searchBox);
    assert.equal(searchBoxInput.attr('placeholder'), 'Search MeSH');
    await fillIn(searchBoxInput, 'descriptor');
    await click('span.search-icon', searchBox);
    let searchResults = find('.mesh-search-results li', meshManager);
    assert.equal(searchResults.length, fixtures.meshDescriptors.length);

    for(let i = 0; i < fixtures.meshDescriptors.length; i++){
      let meshDescriptorName = find('.descriptor-name', searchResults[i]).eq(0);
      assert.equal(getElementText(meshDescriptorName), getText(fixtures.meshDescriptors[i].name));
    }

    for (let i = 0; i < fixtures.meshDescriptors.length; i++){
      if(objective.meshDescriptorIds.indexOf(fixtures.meshDescriptors[i].id) !== -1){
        assert.ok(find(searchResults[i]).classList.contains('disabled'));
      } else {
        assert.ok(!find(searchResults[i]).classList.contains('disabled'));
      }
    }
    await click(find('.selected-terms li'), meshManager);
    assert.ok(!find(find('.mesh-search-results li'), meshManager).classList.contains('disabled'));
    await click(searchResults[3]);
    assert.ok(find(findAll('.mesh-search-results li')[3], meshManager).classList.contains('disabled'));

    let newExpectedMesh = [
      fixtures.meshDescriptors[1],
      fixtures.meshDescriptors[3]
    ];
    removableItems = find('.selected-terms li', meshManager);
    assert.equal(removableItems.length, 2);
    for (let i = 0; i < 2; i++){
      let meshDescriptorName = find('.term-title', removableItems[i]).eq(0);
      assert.equal(getElementText(meshDescriptorName), getText(newExpectedMesh[i].name));
    }
  });

  test('save terms', async function(assert) {
    assert.expect(1);
    await visit(url);
    let detailObjectives = find('.detail-objectives').eq(0);
    await click('.session-objective-list tbody tr:eq(0) td:eq(2) .link', detailObjectives);
    let meshManager = find('.mesh-manager', detailObjectives).eq(0);
    let searchBoxInput = find('.search-box input', meshManager);
    await fillIn(searchBoxInput, 'descriptor');
    await click('.search-box span.search-icon', meshManager);
    let searchResults = find('.mesh-search-results li', meshManager);
    await click(find('.selected-terms li'), meshManager);
    await click(searchResults[2]);
    await click('button.bigadd', detailObjectives);
    let expectedMesh = fixtures.meshDescriptors[2].name;
    let tds = find('.session-objective-list tbody tr:eq(0) td');
    assert.equal(getElementText(tds.eq(2)), getText(expectedMesh));
  });

  test('cancel changes', async function(assert) {
    assert.expect(1);
    await visit(url);
    let detailObjectives = find('.detail-objectives').eq(0);
    await click('.session-objective-list tbody tr:eq(0) td:eq(2) .link', detailObjectives);
    let meshManager = find('.mesh-manager', detailObjectives).eq(0);
    let searchBoxInput = find('.search-box input', meshManager);
    await fillIn(searchBoxInput, 'descriptor');
    await click('.search-box span.search-icon', meshManager);
    let searchResults = find('.mesh-search-results li', meshManager);
    await click(find('.selected-terms li'), meshManager);
    await click(searchResults[1]);
    await click(searchResults[2]);
    await click(searchResults[3]);
    await click('button.bigcancel', detailObjectives);
    let tds = find('.session-objective-list tbody tr:eq(0) td');
    assert.equal(getElementText(tds.eq(2)), getText('descriptor 0'));
  });
});
