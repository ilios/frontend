import Ember from 'ember';
import {
  module,
  test
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';

var application;
var fixtures = {};
var url = '/courses/1/sessions/1';
module('Acceptance: Session - Objective List', {
  beforeEach: function() {
    application = startApp();
    authenticateSession();
    server.create('user', {id: 4136});
    server.create('school');
    server.create('course', {
      sessions: [1]
    });
    server.create('sessionType');
  },

  afterEach: function() {
    Ember.run(application, 'destroy');
  }
});

test('list objectives', function(assert) {
  assert.expect(40);
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

test('long objective', function(assert) {
  assert.expect(3);
  var longTitle = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam placerat tempor neque ut egestas. In cursus dignissim erat, sed porttitor mauris tincidunt at. Nunc et tortor in purus facilisis molestie. Phasellus in ligula nisi. Nam nec mi in urna mollis pharetra. Suspendisse in nibh ex. Curabitur maximus diam in condimentum pulvinar. Phasellus sit amet metus interdum, molestie turpis vel, bibendum eros. In fermentum elit in odio cursus cursus. Nullam ipsum ipsum, fringilla a efficitur non, vehicula vitae enim. Duis ultrices vitae neque in pulvinar. Nulla molestie vitae quam eu faucibus. Vestibulum tempor, tellus in dapibus sagittis, velit purus maximus lectus, quis ullamcorper sem neque quis sem. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Sed commodo risus sed tellus imperdiet, ac suscipit justo scelerisque. Quisque sit amet nulla efficitur, sollicitudin sem in, venenatis mi. Quisque sit amet neque varius, interdum quam id, condimentum ipsum. Quisque tincidunt efficitur diam ut feugiat. Duis vehicula mauris elit, vel vehicula eros commodo rhoncus. Phasellus ac eros vel turpis egestas aliquet. Nam id dolor rutrum, imperdiet purus ac, faucibus nisi. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Nam aliquam leo eget quam varius ultricies. Suspendisse pellentesque varius mi eu luctus. Integer lacinia ornare magna, in egestas quam molestie non.';
  server.create('objective', {
    sessions: [1],
    title: longTitle
  });

  fixtures.session = server.create('session', {
    course: 1,
    objectives: [1]
  });
  visit(url);
  andThen(function() {
    let objectiveRows = find('.session-objective-list tbody tr');
    assert.equal(objectiveRows.length, 1);
    let td = find('.session-objective-list tbody tr:eq(0) td:eq(0)');
    assert.equal(getElementText(td), getText(longTitle.substring(0,200)));
    click('i:eq(0)', td).then(function(){
      assert.equal(getElementText(td), getText(longTitle));
    });
  });
});

test('edit objective title', function(assert) {
  assert.expect(3);
  var objective = server.create('objective', {
    courses: [1],
  });

  fixtures.session = server.create('session', {
    course: 1,
    objectives: [1]
  });
  visit(url);
  andThen(function() {
    var container = find('.session-objective-list');
    let td = find('tbody tr:eq(0) td:eq(0)', container);
    assert.equal(getElementText(td), getText(objective.title));
    click('.editable span', td);
    
    andThen(function(){
      //wait for the editor to load
      Ember.run.later(()=>{
        let editor = find('.froala-box', td);
        let editorContents = editor.editable('getText');
        assert.equal(getText(editorContents), getText(objective.title));
        
        editor.editable('setHTML', 'new title');
        click(find('.actions .done', td));
        andThen(function(){
          assert.equal(getElementText(find('tbody tr:eq(0) td:eq(0)', container)), getText('new title'));
        });
      }, 100);
    });
  });
});
