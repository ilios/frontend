import destroyApp from '../../helpers/destroy-app';
import {
  module,
  test
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';
import Ember from 'ember';

var application;
var fixtures = {};
var url = '/courses/1?details=true&courseObjectiveDetails=true';
module('Acceptance: Course - Objective List', {
  beforeEach: function() {
    application = startApp();
    setupAuthentication(application);
    server.create('school');
    server.create('academicYear', {id: 2013});
    server.createList('program', 2);
    server.createList('programYear', 2);
    server.createList('cohort', 2);

  },

  afterEach: function() {
    destroyApp(application);
  }
});

test('list objectives', function(assert) {
  assert.expect(40);
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
    school: 1,
    objectives: [3,4,5,6,7,8,9,10,11,12,13,14,15]
  });
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

test('long objective', function(assert) {
  assert.expect(3);
  var longTitle = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam placerat tempor neque ut egestas. In cursus dignissim erat, sed porttitor mauris tincidunt at. Nunc et tortor in purus facilisis molestie. Phasellus in ligula nisi. Nam nec mi in urna mollis pharetra. Suspendisse in nibh ex. Curabitur maximus diam in condimentum pulvinar. Phasellus sit amet metus interdum, molestie turpis vel, bibendum eros. In fermentum elit in odio cursus cursus. Nullam ipsum ipsum, fringilla a efficitur non, vehicula vitae enim. Duis ultrices vitae neque in pulvinar. Nulla molestie vitae quam eu faucibus. Vestibulum tempor, tellus in dapibus sagittis, velit purus maximus lectus, quis ullamcorper sem neque quis sem. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Sed commodo risus sed tellus imperdiet, ac suscipit justo scelerisque. Quisque sit amet nulla efficitur, sollicitudin sem in, venenatis mi. Quisque sit amet neque varius, interdum quam id, condimentum ipsum. Quisque tincidunt efficitur diam ut feugiat. Duis vehicula mauris elit, vel vehicula eros commodo rhoncus. Phasellus ac eros vel turpis egestas aliquet. Nam id dolor rutrum, imperdiet purus ac, faucibus nisi. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Nam aliquam leo eget quam varius ultricies. Suspendisse pellentesque varius mi eu luctus. Integer lacinia ornare magna, in egestas quam molestie non.';
  server.create('objective', {
    courses: [1],
    title: longTitle
  });

  fixtures.course = server.create('course', {
    year: 2013,
    school: 1,
    objectives: [1]
  });
  visit(url);
  andThen(function() {
    let objectiveRows = find('.course-objective-list tbody tr');
    assert.equal(objectiveRows.length, 1);
    let td = find('.course-objective-list tbody tr:eq(0) td:eq(0)');
    assert.equal(getElementText(td), getText(longTitle.substring(0,200)));
    click('i:eq(0)', td);
    andThen(function(){
      assert.equal(getElementText(find('.fr-element', td)), getText(longTitle));
    });
  });
});

test('edit objective title', function(assert) {
  assert.expect(3);
  var objective = server.create('objective', {
    courses: [1],
  });

  fixtures.course = server.create('course', {
    year: 2013,
    school: 1,
    objectives: [1]
  });
  visit(url);
  andThen(function() {
    var container = find('.course-objective-list');
    let td = find('tbody tr:eq(0) td:eq(0)', container);
    assert.equal(getElementText(td), getText(objective.title));
    click('.editable span', td);
    andThen(function(){
      //wait for the editor to load
      Ember.run.later(()=>{
        let editor = find('.froalaEditor', td);
        let editorContents = editor.data('froala.editor').$el.text();
        assert.equal(getText(editorContents), getText(objective.title));

        editor.froalaEditor('html.set', 'new title');
        editor.froalaEditor('events.trigger', 'contentChanged');
        click(find('.actions .done', td));
        andThen(function(){
          assert.equal(getElementText(find('tbody tr:eq(0) td:eq(0)', container)), getText('new title'));
        });
      }, 100);
    });
  });
});

test('empty objective title can not be saved', function(assert) {
  assert.expect(4);
  server.create('objective', {
    courses: [1],
  });

  server.create('course', {
    year: 2013,
    school: 1,
    objectives: [1]
  });
  visit(url);
  const container = '.course-objective-list';
  const title = `${container} tbody tr:eq(0) td:eq(0)`;
  const edit = `${title} .editable span`;
  const editor = `${title} .froalaEditor`;
  const initialObjectiveTitle = 'objective 0';
  const save = `${title} .done`;
  const errorMessage = `${title} .validation-error-message`;

  andThen(function() {
    assert.equal(getElementText(title), getText(initialObjectiveTitle));
    click(edit);
    andThen(function(){
      //wait for the editor to load
      Ember.run.later(()=>{

        let editorContents = find(editor).data('froala.editor').$el.text();
        assert.equal(getText(editorContents), getText(initialObjectiveTitle));

        find(editor).froalaEditor('html.set', '<p>&nbsp</p><div></div><span>  </span>');
        find(editor).froalaEditor('events.trigger', 'contentChanged');
        Ember.run.later(()=>{
          assert.equal(getElementText(errorMessage), getText('This field cannot be blank'));
          assert.ok(find(save).is(':disabled'));
        }, 100);
      }, 100);
    });
  });
});
