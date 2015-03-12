import Ember from 'ember';
import {
  module,
  test
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';
import startServer from 'ilios/tests/helpers/start-server';
import mockCurrentUser from 'ilios/tests/helpers/mock-currentuser';

var application;
var server;

module('Acceptance: Course - Objective Mesh Descriptors', {
  beforeEach: function() {
    mockCurrentUser(4136);
    application = startApp();
    server = startServer();
  },

  afterEach: function() {
    Ember.run(application, 'destroy');
    server.shutdown();
  }
});

test('list terms', function(assert) {
  assert.expect(1);
  visit('/course/595?details=true');
  andThen(function() {
    let tds = find('.course-objective-list tbody tr:eq(7) td');
    assert.equal(getText(tds.eq(2)), 'PharmacokineticsAutonomicNervousSystem');
  });
});

test('manage terms', function(assert) {
  assert.expect(21);
  visit('/course/595?details=true');
  andThen(function() {
    let detailObjectives = find('.detail-objectives').eq(0);
    click('.course-objective-list tbody tr:eq(7) td:eq(2) a', detailObjectives);
    assert.equal(getText(find('.detail-specific-title', detailObjectives)), 'SelectMeSHDescriptors');
    let meshManager = find('.mesh-manager', detailObjectives).eq(0);
    andThen(function() {
      let expectedMesh = [
        'AutonomicNervousSystem',
        'Pharmacokinetics'
      ];
      let removableItems = find('.removable-list li', meshManager);
      assert.equal(removableItems.length, 2);
      for (let i = 0; i < 2; i++){
        assert.equal(getText(removableItems.eq(i)), expectedMesh[i]);
      }
      let searchBox = find('.search-box', meshManager);
      assert.equal(searchBox.length, 1);
      searchBox = searchBox.eq(0);
      let searchBoxInput = find('input', searchBox);
      assert.equal(searchBoxInput.attr('placeholder'), 'Search MeSH');
      fillIn(searchBoxInput, 'Nervous');
      click('button', searchBox);
      andThen(function(){
        let expectedMeshResults =  [
          'AutonomicNervousSystem',
          'CentralNervousSystem',
          'NervousSystem',
          'Neurophysiology',
          'ParasympatheticNervousSystem',
          'SympatheticNervousSystem',
          'EntericNervousSystem',
          'PeripheralNervousSystem',
        ];
        let searchResults = find('.mesh-search-results li', meshManager);
        assert.equal(searchResults.length, 8);

        for(let i = 0; i < 8; i++){
          assert.equal(getText($(searchResults[i])), expectedMeshResults[i]);
        }
        assert.ok($(searchResults[0]).hasClass('disabled'), 'Already selected disabled');
        click('.removable-list li:eq(0)', meshManager);
        assert.ok(!$(find('.mesh-search-results li:eq(0)', meshManager)).hasClass('disabled'), 'Clicked and now disalbed');
        click(searchResults[2]);
        andThen(function(){
          assert.ok($(find('.mesh-search-results li:eq(2)', meshManager)).hasClass('disabled'), 'New selectd disabled');

          let newExpectedMesh = [
            'NervousSystem',
            'Pharmacokinetics'
          ];
          removableItems = find('.removable-list li', meshManager);
          assert.equal(removableItems.length, 2);
          for (let i = 0; i < 2; i++){
            assert.equal(getText(removableItems.eq(i)), newExpectedMesh[i]);
          }
        });
      });
    });
  });
});

test('save terms', function(assert) {
  assert.expect(13);
  visit('/course/595?details=true');
  andThen(function() {
    let detailObjectives = find('.detail-objectives').eq(0);
    click('.course-objective-list tbody tr:eq(7) td:eq(2) a', detailObjectives);
    let meshManager = find('.mesh-manager', detailObjectives).eq(0);
    andThen(function() {
      let searchBoxInput = find('.search-box input', meshManager);
      fillIn(searchBoxInput, 'Brain');
      click('.search-box button', meshManager);
      andThen(function(){
        let searchResults = find('.mesh-search-results li', meshManager);
        click('.removable-list li:eq(0)', meshManager);
        click(searchResults[0]);
        //the mesh we are removing objective from
        server.put('/api/meshdescriptors/D001341', function(request) {
          let body = JSON.parse(request.requestBody);
          assert.ok('meshDescriptor' in body, 'mesh request contains correct body');
          assert.ok('objectives' in body.meshDescriptor, 'mesh request has objectives');
          assert.ok(body.meshDescriptor.objectives.indexOf('76357') === -1, 'our objective is not in the mesh request');
          body.meshDescriptor.id = 'D001341';
          return [200, {"Content-Type": "application/json"}, JSON.stringify({meshDescriptor: body.meshDescriptor})];
        });
        //the mesh we are adding objective to
        server.put('/api/meshdescriptors/D010599', function(request) {
          let body = JSON.parse(request.requestBody);
          assert.ok('meshDescriptor' in body, 'mesh request contains correct body');
          assert.ok('objectives' in body.meshDescriptor, 'mesh request has objectives');
          assert.ok(body.meshDescriptor.objectives.indexOf('76357') !== -1, 'our objective is in the mesh request');
          body.meshDescriptor.id = 'D010599';
          return [200, {"Content-Type": "application/json"}, JSON.stringify({meshDescriptor: body.meshDescriptor})];
        });
        //the mesh we are adding objective to
        server.put('/api/meshdescriptors/D001812', function(request) {
          let body = JSON.parse(request.requestBody);
          assert.ok('meshDescriptor' in body, 'mesh request contains correct body');
          assert.ok('objectives' in body.meshDescriptor, 'mesh request has objectives');
          assert.ok(body.meshDescriptor.objectives.indexOf('76357') !== -1, 'our objective is in the mesh request');
          body.meshDescriptor.id = 'D001812';
          return [200, {"Content-Type": "application/json"}, JSON.stringify({meshDescriptor: body.meshDescriptor})];
        });
        server.put('/api/objectives/76357', function(request) {
          let body = JSON.parse(request.requestBody);
          assert.ok('objective' in body, 'objective request contains correct body');
          assert.ok('meshDescriptors' in body.objective, 'objective request has descriptors');
          assert.ok(body.objective.meshDescriptors.indexOf('D010599') !== -1, 'our descriptor is in the objective request');
          body.objective.id = '76357';
          return [200, {"Content-Type": "application/json"}, JSON.stringify({objective: body.objective})];
        });

        click('button.bigadd', detailObjectives);
        andThen(function(){
          let tds = find('.course-objective-list tbody tr:eq(7) td');
          assert.equal(getText(tds.eq(2)), 'PharmacokineticsBlood-BrainBarrier');
        });
      });
    });
  });
});

test('cancel changes', function(assert) {
  assert.expect(1);
  visit('/course/595?details=true');
  andThen(function() {
    let detailObjectives = find('.detail-objectives').eq(0);
    click('.course-objective-list tbody tr:eq(7) td:eq(2) a', detailObjectives);
    let meshManager = find('.mesh-manager', detailObjectives).eq(0);
    andThen(function() {
      let searchBoxInput = find('.search-box input', meshManager);
      fillIn(searchBoxInput, 'Brain');
      click('.search-box button', meshManager);
      andThen(function(){
        let searchResults = find('.mesh-search-results li', meshManager);
        click('.removable-list li:eq(0)', meshManager);
        click(searchResults[0]);
        click('button.bigcancel', detailObjectives);
        andThen(function(){
          let tds = find('.course-objective-list tbody tr:eq(7) td');
          assert.equal(getText(tds.eq(2)), 'PharmacokineticsAutonomicNervousSystem');
        });
      });
    });
  });
});
