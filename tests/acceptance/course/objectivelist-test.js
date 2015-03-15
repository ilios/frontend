import Ember from 'ember';
import {
  module,
  test
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';

var application;
var fixtures = {};
var url = '/course/1?details=true';
module('Acceptance: Course - Objective List', {
  beforeEach: function() {
    application = startApp();
    server.create('user', {id: 4136});
    server.create('school');
    server.create('educationalYear', {id: 2013});
    server.createList('program', 2);
    server.createList('programYear', 2);
    server.createList('cohort', 2);
    fixtures.competencies = [];
    fixtures.competencies.pushObjects(server.createList('competency', 2));
    fixtures.parentObjectives = [];
    fixtures.parentObjectives.pushObject(server.create('objective', {
        children: [3],
        competency: 1
    }));
    fixtures.parentObjectives.pushObject(server.create('objective', {
        children: [4]
    }));

    fixtures.meshDescriptors = [];
    fixtures.meshDescriptors.pushObject(server.create('meshDescriptor', {
      objectives: [2,3],
    }));
    fixtures.meshDescriptors.pushObject(server.create('meshDescriptor', {
      objectives: [3],
    }));
    fixtures.meshDescriptors.pushObjects(server.createList('meshDescriptor', 5, {
      objectives: [3],
    }));
    fixtures.courseObjectives = [];
    fixtures.courseObjectives.pushObject(server.create('objective', {
      courses: [1],
      parents: [1],
      meshDecriptors: [1]
    }));
    fixtures.courseObjectives.pushObject(server.create('objective', {
      courses: [1],
      parents: [2],
      meshDecriptors: [1,2]
    }));
    fixtures.courseObjectives.pushObjects(server.createList('objective', 11, {
      courses: [1],
    }));
    fixtures.course = server.create('course', {
      year: 2013,
      owningSchool: 1,
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
    let objectiveRows = find('.course-objective-list tbody tr');
    assert.equal(objectiveRows.length, fixtures.courseObjectives.length);

    var extractMeshName = function(id){
      return fixtures.meshDescriptors[id - 1].name;
    };

    for(let i = 0; i < fixtures.courseObjectives.length; i++){
      let tds = find('td', objectiveRows.eq(i));
      let objective = fixtures.courseObjectives[i];

      let parentTitle = '';
      if('parents' in objective){
        let parent = fixtures.parentObjectives[objective.parents[0] - 1];
        parentTitle = parent.title;
        if('competency' in parent){
          parentTitle += `(${fixtures.competencies[parent.competency - 1].title})`;
        }
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
