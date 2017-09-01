import Ember from 'ember';
import {
  moduleForModel,
  test
} from 'ember-qunit';
import modelList from '../../helpers/model-list';

const { run } = Ember;

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

test('competency domains', async function(assert) {
  assert.expect(4);
  let programYear = this.subject();
  let store = this.store();
  run ( async () => {
    let subCompetency1 = store.createRecord('competency', { id: 1, title: 'Bubbles' });
    let subCompetency2 = store.createRecord('competency', { id: 2, title: 'Ricky' });
    let subCompetency3 = store.createRecord('competency', { id: 3, title: 'Julian' });
    let domain1 = store.createRecord('competency', { id: 4, title: 'Trevor', children: [ subCompetency1, subCompetency2 ] });
    let domain2 = store.createRecord('competency', { id: 5, title: 'Corey' });
    let domain3 = store.createRecord('competency', { id: 6, title: 'Cyrus', children: [ subCompetency3 ] });

    programYear.get('competencies').pushObjects([ subCompetency3, domain2, subCompetency1, subCompetency2 ]);

    let domains = await programYear.get('competencyDomains');
    assert.equal(domains.length, 3);
    assert.equal(domains[0].get('content'), domain2);
    assert.equal(domains[1].get('content'), domain3);
    assert.equal(domains[2].get('content'), domain1);
  });
});
