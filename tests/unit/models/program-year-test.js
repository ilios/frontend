import Ember from 'ember';
import {
  moduleForModel,
  test
} from 'ember-qunit';
import modelList from '../../helpers/model-list';
import { initialize } from '../../../initializers/replace-promise';

initialize();
moduleForModel('program-year', 'Unit | Model | ProgramYear', {
  needs: modelList
});

test('it exists', function(assert) {
  let model = this.subject();
  // let store = this.store();
  assert.ok(!!model);
});

test('academic year string', function(assert) {
  let model = this.subject();
  Ember.run(function(){
    model.set('startYear', 2000);
    assert.equal(model.get('academicYear'), '2000 - 2001');
  });
});

test('classOf string', function(assert) {
  assert.expect(3);
  let model = this.subject();
  var store = model.store;
  Ember.run(function(){
    let program = store.createRecord('program', {id:99, duration:1});
    model.set('program', program);
    model.set('startYear', 2000);
    assert.equal(model.get('classOfYear'), '2001');
    program.set('duration', 5);
    assert.equal(model.get('classOfYear'), '2005');
    model.set('startYear', 2001);
    assert.equal(model.get('classOfYear'), '2006');
  });
});
