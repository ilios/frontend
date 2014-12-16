import {
  moduleForModel,
  test
} from 'ember-qunit';
import Ember from 'ember';

moduleForModel('offering', 'Offering', {
  needs: [
    'model:session',
    'model:course',
    'model:user',
    'model:school',
    'model:instructor-group',
    'model:cohort',
    'model:objective',
  ]
});

test('it exists', function() {
  var model = this.subject();
  // var store = this.store();
  ok(!!model);
});

test('title from session', function() {
  var model = this.subject();
  var store = model.store;
  Ember.run(function(){
     store.createRecord('session', {id:99, title:'Test Title'});
     var session = store.find('session', 99).then(function(session){
       model.set('session', session);
     });
  });

  equal(model.get('title'), 'Test Title');
});
