import destroyApp from '../../helpers/destroy-app';
import {
  module,
  test
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';
import wait from 'ember-test-helpers/wait';

var application;
var url = '/courses/1?details=true&courseObjectiveDetails=true';
var fixtures = {};
module('Acceptance: Course - Objective Mesh Descriptors', {
  beforeEach: function() {
    application = startApp();
    setupAuthentication(application);
    server.create('school');
    server.create('academicYear', {id: 2013});
    server.createList('program', 2);
    server.createList('programYear', 2);
    server.createList('cohort', 2);

    fixtures.meshDescriptors = [];
    fixtures.meshDescriptors.pushObjects(server.createList('meshDescriptor', 6));
    fixtures.courseObjectives = [];
    fixtures.courseObjectives.pushObject(server.create('objective', {
      meshDescriptorIds: [1]
    }));
    fixtures.courseObjectives.pushObject(server.create('objective', {
      meshDescriptorIds: [2,3,4,5,6]
    }));
    fixtures.courseObjectives.pushObject(server.create('objective'));
    //create some other objectives not in this course
    server.createList('objective', 2);

    //create some extra descriptors that shouldn't be found in search
    server.createList('meshDescriptor', 10, {name: 'nope', annotation: 'nope'});

    fixtures.course = server.create('course', {
      year: 2013,
      schoolId: 1,
      objectiveIds: [1,2,3]
    });
  },

  afterEach: function() {
    destroyApp(application);
  }
});

test('manage terms', async function(assert) {
  assert.expect(27);
  await visit(url);
  let detailObjectives = find('.detail-objectives').eq(0);
  await click('.course-objective-list tbody tr:eq(1) td:eq(2) .link', detailObjectives);
  assert.equal(getElementText(find('.specific-title', detailObjectives)), 'SelectMeSHDescriptorsforObjective');

  let meshManager = find('.mesh-manager', detailObjectives).eq(0);
  let objective = fixtures.courseObjectives[1];
  let removableItems = find('.removable-list li', meshManager);
  assert.equal(removableItems.length, objective.meshDescriptors.length);
  for (let i = 0; i < objective.meshDescriptors.length; i++){
    let meshDescriptorName = find('.content .title', removableItems[i]).eq(0);
    assert.equal(getElementText(meshDescriptorName), getText(fixtures.meshDescriptors[objective.meshDescriptors.models[i].id - 1].name));
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
    if(objective.attrs.meshDescriptorIds.indexOf(parseInt(fixtures.meshDescriptors[i].id)) !== -1){
      assert.ok(find(searchResults[i]).hasClass('disabled'));
    } else {
      assert.ok(!find(searchResults[i]).hasClass('disabled'));
    }
  }
  await click('.removable-list li:eq(0)', meshManager);
  assert.ok(!find('.mesh-search-results li:eq(1)', meshManager).hasClass('disabled'));
  await click(searchResults[0]);
  assert.ok(find('.mesh-search-results li:eq(0)', meshManager).hasClass('disabled'));

  let newExpectedMesh = [
    fixtures.meshDescriptors[0].name,
    fixtures.meshDescriptors[2].name,
    fixtures.meshDescriptors[3].name,
    fixtures.meshDescriptors[4].name,
    fixtures.meshDescriptors[5].name,
  ];
  removableItems = find('.removable-list li', meshManager);
  assert.equal(removableItems.length, 5);
  for (let i = 0; i < 2; i++){
    let meshDescriptorName = find('.content .title', removableItems[i]).eq(0);
    assert.equal(getElementText(meshDescriptorName), getText(newExpectedMesh[i]));
  }
  await wait();
});

test('save terms', async function(assert) {
  assert.expect(1);
  await visit(url);
  let detailObjectives = find('.detail-objectives').eq(0);
  await click('.course-objective-list tbody tr:eq(0) td:eq(2) .link', detailObjectives);
  let meshManager = find('.mesh-manager', detailObjectives).eq(0);
  let searchBoxInput = find('.search-box input', meshManager);
  await fillIn(searchBoxInput, 'descriptor');
  await click('.search-box span.search-icon', meshManager);
  let searchResults = find('.mesh-search-results li', meshManager);
  await click('.removable-list li:eq(0)', meshManager);
  await click(searchResults[1]);
  await click('button.bigadd', detailObjectives);
  let expectedMesh = fixtures.meshDescriptors[1].name;
  let tds = find('.course-objective-list tbody tr:eq(0) td');
  assert.equal(getElementText(tds.eq(2)), getText(expectedMesh));
});

test('cancel changes', async function(assert) {
  assert.expect(1);
  await visit(url);
  let detailObjectives = find('.detail-objectives').eq(0);
  await click('.course-objective-list tbody tr:eq(0) td:eq(2) .link', detailObjectives);
  let meshManager = find('.mesh-manager', detailObjectives).eq(0);
  let searchBoxInput = find('.search-box input', meshManager);
  await fillIn(searchBoxInput, 'descriptor');
  await click('.search-box span.search-icon', meshManager);
  let searchResults = find('.mesh-search-results li', meshManager);
  await click('.removable-list li:eq(0)', meshManager);
  await click(searchResults[1]);
  await click(searchResults[2]);
  await click(searchResults[3]);
  await click('button.bigcancel', detailObjectives);
  let tds = find('.course-objective-list tbody tr:eq(0) td');
  assert.equal(getElementText(tds.eq(2)), getText('descriptor 0'));
});
