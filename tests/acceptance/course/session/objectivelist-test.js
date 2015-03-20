import Ember from 'ember';
import {
  module,
  test
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';

var application;
var fixtures = {};
var url = '/course/1/session/1';
module('Acceptance: Session - Objective List', {
  beforeEach: function() {
    application = startApp();
    server.create('user', {id: 4136});
    server.create('school');
    server.create('course', {
      sessions: [1]
    });
    server.create('sessionType');
    fixtures.parentObjectives = [];
    fixtures.parentObjectives.pushObject(server.create('objective', {
        children: [3,4],
        courses: [1]
    }));
    fixtures.parentObjectives.pushObject(server.create('objective', {
        children: [4],
        courses: [1]
    }));


    fixtures.meshDescriptors = [];
    fixtures.meshDescriptors.pushObject(server.create('meshDescriptor', {
      objectives: [3,4],
    }));
    fixtures.meshDescriptors.pushObjects(server.createList('meshDescriptor', 5, {
      objectives: [4],
    }));

    fixtures.sessionObjectives = [];
    fixtures.sessionObjectives.pushObject(server.create('objective', {
      sessions: [1],
      parents: [1],
      meshDescriptors: [1]
    }));
    fixtures.sessionObjectives.pushObject(server.create('objective', {
      sessions: [1],
      parents: [1,2],
      meshDescriptors: [1,2]
    }));
    fixtures.sessionObjectives.pushObjects(server.createList('objective', 11, {
      sessions: [1],
    }));
    fixtures.session = server.create('session', {
      course: 1,
      objectives: [3,4,5,6,7,8,9,10,11,12,13,14,15]
    });
  },

  afterEach: function() {
    Ember.run(application, 'destroy');
  }
});

test('list objectives', function(assert) {
  assert.expect(40);
  visit(url);
  andThen(function() {
    let objectiveRows = find('.session-objective-list tbody tr');
    assert.equal(objectiveRows.length, fixtures.sessionObjectives.length);
    var extractParentTitle = function(id){
      return fixtures.parentObjectives[id - 1].title;
    };
    var extractMeshName = function(id){
      return fixtures.meshDescriptors[id - 1].name;
    };
    for(let i = 0; i < fixtures.sessionObjectives.length; i++){
      let tds = find('td', objectiveRows.eq(i));
      let objective = fixtures.sessionObjectives[i];

      let parentTitle;
      if('parents' in objective){
        parentTitle = objective.parents.map(extractParentTitle).join('');
      } else {
        parentTitle = 'Add New';
      }

      let meshTitle;
      if('meshDescriptors' in objective){
        meshTitle = objective.meshDescriptors.map(extractMeshName).join('');
      } else {
        meshTitle = 'Add New';
      }
      assert.equal(getElementText(tds.eq(0)), getText(objective.title));
      assert.equal(getElementText(tds.eq(1)), getText(parentTitle));
      assert.equal(getElementText(tds.eq(2)), getText(meshTitle));
    }

  });
});
