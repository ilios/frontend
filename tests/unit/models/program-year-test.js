import Ember from 'ember';
import {
  moduleForModel,
  test
} from 'ember-qunit';

moduleForModel('program-year', 'ProgramYear', {
  // Specify the other units that are required for this test.
  needs: [
    'model:program',
    'model:user',
    'model:competency',
    'model:discipline',
    'model:objective',
    'model:offering',
    'model:school',
    'model:course',
    'model:session',
    'model:mesh-descriptor',
    'model:instructor-group'
  ]
});

test('it exists', function() {
  var model = this.subject();
  // var store = this.store();
  ok(!!model);
});

test('academic year string', function() {
  var model = this.subject();
  Ember.run(function(){
    model.set('startYear', 2000);
    equal(model.get('academicYear'), '2000 - 2001');
  });
});

test('classOf string', function() {
  expect(3);
  var model = this.subject();
  var store = model.store;
  Ember.run(function(){
    store.createRecord('program', {id:99, duration:1});
    store.find('program', 99).then(function(program){
      model.set('program', program);
      model.set('startYear', 2000);
      equal(model.get('classOfYear'), '2001');
      program.set('duration', 5);
      equal(model.get('classOfYear'), '2005');
      model.set('startYear', 2001);
      equal(model.get('classOfYear'), '2006');
    });
  });
});
