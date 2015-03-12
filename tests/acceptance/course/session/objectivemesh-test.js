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

module('Acceptance: Session - Objective Mesh Descriptors', {
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
  visit('/course/595/session/16555');
  andThen(function() {
    let tds = find('.session-objective-list tbody tr:eq(0) td');
    assert.equal(getText(tds.eq(2)), 'AddNew');
  });
});

test('manage terms', function(assert) {
  assert.expect(17);
  visit('/course/595/session/16555');
  andThen(function() {
    let detailObjectives = find('.detail-objectives').eq(0);
    click('.session-objective-list tbody tr:eq(0) td:eq(2) button', detailObjectives);
    assert.equal(getText(find('.detail-specific-title', detailObjectives)), 'SelectMeSHDescriptors');
    let meshManager = find('.mesh-manager', detailObjectives).eq(0);
    andThen(function() {
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
        click(searchResults[0]);
        click(searchResults[2]);
        andThen(function(){
          assert.ok($(find('.mesh-search-results li:eq(0)', meshManager)).hasClass('disabled'));
          assert.ok($(find('.mesh-search-results li:eq(2)', meshManager)).hasClass('disabled'));

          let newExpectedMesh = [
            'AutonomicNervousSystem',
            'NervousSystem'
          ];
          let removableItems = find('.removable-list li', meshManager);
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
  assert.expect(7);
  visit('/course/595/session/16555');
  andThen(function() {
    let detailObjectives = find('.detail-objectives').eq(0);
    click('.session-objective-list tbody tr:eq(0) td:eq(2) button', detailObjectives);
    let meshManager = find('.mesh-manager', detailObjectives).eq(0);
    andThen(function() {
      let searchBoxInput = find('.search-box input', meshManager);
      fillIn(searchBoxInput, 'Ethics');
      click('.search-box button', meshManager);
      andThen(function(){
        let searchResults = find('.mesh-search-results li', meshManager);
        click(searchResults[0]);
        //the mesh we are adding objective to
        server.put('/api/meshdescriptors/D004989', function(request) {
          let body = JSON.parse(request.requestBody);
          assert.ok('meshDescriptor' in body);
          assert.ok('objectives' in body.meshDescriptor);
          assert.ok(body.meshDescriptor.objectives.indexOf('76922') !== -1);
          body.meshDescriptor.id = 'D004989';
          return [200, {"Content-Type": "application/json"}, JSON.stringify({meshDescriptor: body.meshDescriptor})];
        });
        server.put('/api/objectives/76922', function(request) {
          let body = JSON.parse(request.requestBody);
          assert.ok('objective' in body);
          assert.ok('meshDescriptors' in body.objective);
          assert.ok(body.objective.meshDescriptors.indexOf('D004989') !== -1);
          body.objective.id = '76922';
          return [200, {"Content-Type": "application/json"}, JSON.stringify({objective: body.objective})];
        });

        click('button.bigadd', detailObjectives);
        andThen(function(){
          let tds = find('.session-objective-list tbody tr:eq(0) td');
          assert.equal(getText(tds.eq(2)), 'Ethics');
        });
      });
    });
  });
});

test('cancel changes', function(assert) {
  assert.expect(1);
  visit('/course/595/session/16555');
  andThen(function() {
    let detailObjectives = find('.detail-objectives').eq(0);
    click('.session-objective-list tbody tr:eq(0) td:eq(2) button', detailObjectives);
    let meshManager = find('.mesh-manager', detailObjectives).eq(0);
    andThen(function() {
      let searchBoxInput = find('.search-box input', meshManager);
      fillIn(searchBoxInput, 'Arm');
      click('.search-box button', meshManager);
      andThen(function(){
        let searchResults = find('.mesh-search-results li', meshManager);
        click(searchResults[0]);
        click(searchResults[1]);
        click('button.bigcancel', detailObjectives);
        andThen(function(){
          let tds = find('.session-objective-list tbody tr:eq(2) td');
          assert.equal(getText(tds.eq(2)), 'AddNew');
        });
      });
    });
  });
});
