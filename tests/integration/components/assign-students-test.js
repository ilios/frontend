import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';

const { Object, Service, RSVP } = Ember;
const { resolve } = RSVP;

moduleForComponent('assign-students', 'Integration | Component | assign students', {
  integration: true
});

test('nothing', function(assert){
  assert.ok(true);
});

test('it renders', function(assert) {
  let program = Object.create({
    duration: 20,
    title: 'program title'
  });
  let programYear = Object.create({
    program,
    startYear: 2020
  });
  let cohort = Object.create({
    title: 'test cohort',
    programYear
  });

  let school = Object.create({
    id: 1,
    cohorts: resolve([cohort])
  });
  let students = [
    Object.create({
      id: 1,
      fullName: 'test person',
      email: 'tstemail',
      campusId: 'id123'
    }),
    Object.create({
      id: 2,
      fullName: 'second person',
      email: '2nd@.com',
      campusId: '123ID'
    })
  ];

  let storeMock = Service.extend({
    query(what, {filters, limit}){

      assert.equal('cohort', what);
      assert.equal(1000, limit);
      assert.equal(1, filters.schools[0]);
      return resolve([cohort]);
    }
  });
  this.register('service:store', storeMock);

  this.set('school', school);
  this.set('students', students);
  this.on('setOffset', parseInt);
  this.on('setLimit', parseInt);

  this.render(hbs`{{assign-students
    students=students
    school=school
    offset=0
    limit=10
    setOffset=(action 'setOffset')
    setLimit=(action 'setLimit')
  }}`);

  return wait().then(() => {
    let cohortOptions = this.$('select:eq(0) option');
    assert.equal(cohortOptions.length, 1);
    assert.equal(cohortOptions.text().trim(), 'program title test cohort');

    assert.equal(this.$('tbody tr').length, 2);
    assert.equal(this.$('tbody tr:eq(0) td:eq(1)').text().trim(), 'test person');
    assert.equal(this.$('tbody tr:eq(1) td:eq(1)').text().trim(), 'second person');


  });

});

test('check all checks all', function(assert) {
  let school = Object.create({
    id: 1,
    cohorts: resolve([])
  });
  let students = [
    Object.create({
      id: 1,
      fullName: 'test person',
      email: 'tstemail',
      campusId: 'id123'
    })
  ];

  let storeMock = Service.extend({
    query(){
      return resolve([]);
    }
  });
  this.register('service:store', storeMock);

  this.set('school', school);
  this.set('students', students);
  this.on('setOffset', parseInt);
  this.on('setLimit', parseInt);

  this.render(hbs`{{assign-students
    students=students
    school=school
    offset=0
    limit=10
    setOffset=(action 'setOffset')
    setLimit=(action 'setLimit')
  }}`);

  return wait().then(() => {
    assert.notOk(this.$('tbody tr:eq(0) input').prop('checked'));
    this.$('thead th:eq(0)').click();
    return wait().then(() => {
      assert.ok(this.$('tbody tr:eq(0) input').prop('checked'));
    });
  });

});

test('save sets primary cohort', function(assert) {
  let flashmessagesMock = Ember.Service.extend({
    success(message){
      assert.equal(message, 'general.savedSuccessfully');
    }
  });
  this.register('service:flashMessages', flashmessagesMock);
  let program = Object.create({
    duration: 20,
    title: 'program title'
  });
  let programYear = Object.create({
    program,
    startYear: 2020
  });
  let cohort = Object.create({
    title: 'test cohort',
    programYear
  });

  let school = Object.create({
    id: 1,
    cohorts: resolve([cohort])
  });
  let students = [
    Object.create({
      id: 1,
      fullName: 'test person',
      email: 'tstemail',
      campusId: 'id123',
      save(){
        assert.equal(this.get('primaryCohort'), cohort);
      }
    })
  ];

  let storeMock = Service.extend({
    query(){
      return resolve([cohort]);
    }
  });
  this.register('service:store', storeMock);

  this.set('school', school);
  this.set('students', students);
  this.on('setOffset', parseInt);
  this.on('setLimit', parseInt);

  this.render(hbs`{{assign-students
    students=students
    school=school
    offset=0
    limit=10
    setOffset=(action 'setOffset')
    setLimit=(action 'setLimit')
  }}`);

  return wait().then(() => {
    this.$('thead th:eq(0)').click();
    return wait().then(() => {
      this.$('button.done').click();
    });


  });

});
