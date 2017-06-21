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
module('Acceptance: Session - Objective Mesh Descriptors', {
  beforeEach: function() {
    application = startApp();
    setupAuthentication(application);
    server.create('school');
    server.create('course', {
      sessions: [1]
    });
    server.create('sessionType');

    fixtures.meshDescriptors = [];
    fixtures.meshDescriptors.pushObject(server.create('meshDescriptor', {
      objectives: [1,2],
    }));
    fixtures.meshDescriptors.pushObject(server.create('meshDescriptor', {
      objectives: [2],
    }));
    fixtures.meshDescriptors.pushObjects(server.createList('meshDescriptor', 5, {
      objectives: [3],
    }));

    fixtures.sessionObjectives = [];
    fixtures.sessionObjectives.pushObject(server.create('objective', {
      sessions: [1],
      meshDescriptors: [1]
    }));
    fixtures.sessionObjectives.pushObject(server.create('objective', {
      sessions: [1],
      meshDescriptors: [1,2]
    }));
    fixtures.sessionObjectives.pushObjects(server.createList('objective', 11, {
      sessions: [1],
    }));
    fixtures.session = server.create('session', {
      course: 1,
      objectives: [1,2,3,4,5,6,7,8,9,10,11,12,13]
    });

    //create some extra descriptors that shouldn't be found in search
    server.createList('meshDescriptor', 10, {name: 'nope', annotation: 'nope'});

    fixtures.course = server.create('course', {
      year: 2013,
      school: 1,
      sessions: [1]
    });
  },

  afterEach: function() {
    destroyApp(application);
  }
});

test('list terms', function(assert) {
  assert.expect(1 + fixtures.sessionObjectives.length * 3);
  visit(url);
  andThen(function() {
    let extractObjectives = function(position){
      return fixtures.meshDescriptors[position - 1].name;
    };
    let objectiveRows = find('.session-objective-list tbody tr');
    assert.equal(objectiveRows.length, fixtures.sessionObjectives.length);
    for(let i = 0; i < fixtures.sessionObjectives.length; i++){
      let tds = find('td', objectiveRows.eq(i));
      let objective = fixtures.sessionObjectives[i];
      assert.equal(tds.length, 4);
      let descriptors;
      if('meshDescriptors' in objective){
        descriptors = objective.meshDescriptors.map(extractObjectives).join('');
      } else {
        descriptors = 'Add New';
      }

      assert.equal(getElementText(tds.eq(0)), getText(objective.title));
      assert.equal(getElementText(tds.eq(2)), getText(descriptors));
    }
  });
});

test('manage terms', function(assert) {
  assert.expect(26);
  visit(url);
  andThen(function() {
    let detailObjectives = find('.detail-objectives').eq(0);
    click('.session-objective-list tbody tr:eq(1) td:eq(2) .link', detailObjectives);
    andThen(function() {
      assert.equal(getElementText(find('.specific-title', detailObjectives)), 'SelectMeSHDescriptorsforObjective');
      let meshManager = find('.mesh-manager', detailObjectives).eq(0);
      let objective = fixtures.sessionObjectives[1];
      let removableItems = find('.removable-list li', meshManager);
      assert.equal(removableItems.length, objective.meshDescriptors.length);
      for (let i = 0; i < objective.meshDescriptors.length; i++){
        let meshDescriptorName = find('.content .title', removableItems[i]).eq(0);
        assert.equal(getElementText(meshDescriptorName), getText(fixtures.meshDescriptors[objective.meshDescriptors[i] - 1].name));
      }

      let searchBox = find('.search-box', meshManager);
      assert.equal(searchBox.length, 1);
      searchBox = searchBox.eq(0);
      let searchBoxInput = find('input', searchBox);
      assert.equal(searchBoxInput.attr('placeholder'), 'Search MeSH');
      fillIn(searchBoxInput, 'descriptor');
      click('span.search-icon', searchBox);
      andThen(function(){
        let searchResults = find('.mesh-search-results li', meshManager);
        assert.equal(searchResults.length, fixtures.meshDescriptors.length);

        for(let i = 0; i < fixtures.meshDescriptors.length; i++){
          let meshDescriptorName = find('.descriptor-name', searchResults[i]).eq(0);
          assert.equal(getElementText(meshDescriptorName), getText(fixtures.meshDescriptors[i].name));
        }

        for (let i = 0; i < fixtures.meshDescriptors.length; i++){
          if(objective.meshDescriptors.indexOf(parseInt(fixtures.meshDescriptors[i].id)) !== -1){
            assert.ok($(searchResults[i]).hasClass('disabled'));
          } else {
            assert.ok(!$(searchResults[i]).hasClass('disabled'));
          }
        }
        click('.removable-list li:eq(0)', meshManager).then(function(){
          assert.ok(!$(find('.mesh-search-results li:eq(0)', meshManager)).hasClass('disabled'));
        });
        click(searchResults[3]);
        andThen(function(){
          assert.ok($(find('.mesh-search-results li:eq(3)', meshManager)).hasClass('disabled'));

          let newExpectedMesh = [
            fixtures.meshDescriptors[1],
            fixtures.meshDescriptors[3]
          ];
          removableItems = find('.removable-list li', meshManager);
          assert.equal(removableItems.length, 2);
          for (let i = 0; i < 2; i++){
            let meshDescriptorName = find('.title', removableItems[i]).eq(0);
            assert.equal(getElementText(meshDescriptorName), getText(newExpectedMesh[i].name));
          }
        });
      });
    });
  });
});

test('save terms', function(assert) {
  assert.expect(1);
  visit(url);
  andThen(function() {
    let detailObjectives = find('.detail-objectives').eq(0);
    click('.session-objective-list tbody tr:eq(0) td:eq(2) .link', detailObjectives);
    andThen(function() {
      let meshManager = find('.mesh-manager', detailObjectives).eq(0);
      let searchBoxInput = find('.search-box input', meshManager);
      fillIn(searchBoxInput, 'descriptor');
      click('.search-box span.search-icon', meshManager);
      andThen(function(){
        let searchResults = find('.mesh-search-results li', meshManager);
        click('.removable-list li:eq(0)', meshManager);
        click(searchResults[2]);
        click('button.bigadd', detailObjectives);
        andThen(function(){
          let expectedMesh = fixtures.meshDescriptors[2].name;
          let tds = find('.session-objective-list tbody tr:eq(0) td');
          assert.equal(getElementText(tds.eq(2)), getText(expectedMesh));
        });
      });
    });
  });
});

test('cancel changes', function(assert) {
  assert.expect(1);
  visit(url);
  andThen(function() {
    let detailObjectives = find('.detail-objectives').eq(0);
    click('.session-objective-list tbody tr:eq(0) td:eq(2) .link', detailObjectives);
    andThen(function() {
      let meshManager = find('.mesh-manager', detailObjectives).eq(0);
      let searchBoxInput = find('.search-box input', meshManager);
      fillIn(searchBoxInput, 'descriptor');
      click('.search-box span.search-icon', meshManager);
      andThen(function(){
        let searchResults = find('.mesh-search-results li', meshManager);
        click('.removable-list li:eq(0)', meshManager);
        click(searchResults[1]);
        click(searchResults[2]);
        click(searchResults[3]);
        click('button.bigcancel', detailObjectives);
        andThen(function(){
          let tds = find('.session-objective-list tbody tr:eq(0) td');
          let expectedMesh = fixtures.meshDescriptors[fixtures.sessionObjectives[0].meshDescriptors[0] - 1].name;
          assert.equal(getElementText(tds.eq(2)), getText(expectedMesh));
        });
      });
    });
  });
});
