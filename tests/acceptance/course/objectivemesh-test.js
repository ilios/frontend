import destroyApp from '../../helpers/destroy-app';
import {
  module,
  test
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';

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
    fixtures.meshDescriptors.pushObject(server.create('meshDescriptor', {
      objectives: [1],
    }));
    fixtures.meshDescriptors.pushObjects(server.createList('meshDescriptor', 5, {
      objectives: [2],
    }));
    fixtures.courseObjectives = [];
    fixtures.courseObjectives.pushObject(server.create('objective', {
      courses: [1],
      meshDescriptors: [1]
    }));
    fixtures.courseObjectives.pushObject(server.create('objective', {
      courses: [1],
      meshDescriptors: [2,3,4,5,6]
    }));
    fixtures.courseObjectives.pushObject(server.create('objective', {
      courses: [1]
    }));
    //create some other objectives not in this course
    server.createList('objective', 2);

    //create some extra descriptors that shoulnd't be found in search
    server.createList('meshDescriptor', 10, {name: 'nope', annotation: 'nope'});

    fixtures.course = server.create('course', {
      year: 2013,
      school: 1,
      objectives: [1,2,3]
    });
  },

  afterEach: function() {
    destroyApp(application);
  }
});

test('manage terms', function(assert) {
  assert.expect(27);
  visit(url);
  andThen(function() {
    let detailObjectives = find('.detail-objectives').eq(0);
    click('.course-objective-list tbody tr:eq(1) td:eq(2) .link', detailObjectives).then(function(){
      assert.equal(getElementText(find('.specific-title', detailObjectives)), 'SelectMeSHDescriptorsforObjective');
    });

    andThen(function() {
      let meshManager = find('.mesh-manager', detailObjectives).eq(0);
      let objective = fixtures.courseObjectives[1];
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
          assert.ok(!$(find('.mesh-search-results li:eq(1)', meshManager)).hasClass('disabled'));
        });
        click(searchResults[0]);
        andThen(function(){
          assert.ok($(find('.mesh-search-results li:eq(0)', meshManager)).hasClass('disabled'));

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
    click('.course-objective-list tbody tr:eq(0) td:eq(2) .link', detailObjectives);
    andThen(function() {
      let meshManager = find('.mesh-manager', detailObjectives).eq(0);
      let searchBoxInput = find('.search-box input', meshManager);
      fillIn(searchBoxInput, 'descriptor');
      click('.search-box span.search-icon', meshManager);
      andThen(function(){
        let searchResults = find('.mesh-search-results li', meshManager);
        click('.removable-list li:eq(0)', meshManager);
        click(searchResults[1]);
        click('button.bigadd', detailObjectives);
        andThen(function(){
          let expectedMesh = fixtures.meshDescriptors[1].name;
          let tds = find('.course-objective-list tbody tr:eq(0) td');
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
    click('.course-objective-list tbody tr:eq(0) td:eq(2) .link', detailObjectives);
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
          let tds = find('.course-objective-list tbody tr:eq(0) td');
          let expectedMesh = fixtures.meshDescriptors[fixtures.courseObjectives[0].meshDescriptors[0] - 1].name;
          assert.equal(getElementText(tds.eq(2)), getText(expectedMesh));
        });
      });
    });
  });
});
