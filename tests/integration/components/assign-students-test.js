import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';

const { Object:EmberObject, Service, RSVP } = Ember;
const { resolve } = RSVP;

let storeMock;

moduleForComponent('assign-students', 'Integration | Component | assign students', {
  integration: true,
  beforeEach(){
    storeMock = Service.extend({});
    this.register('service:store', storeMock);
  }
});

test('nothing', function(assert){
  assert.ok(true);
});

test('it renders', function(assert) {
  let program = EmberObject.create({
    duration: 20,
    title: 'program title'
  });
  let programYear = EmberObject.create({
    program,
    startYear: 2020
  });
  let cohort = EmberObject.create({
    title: 'test cohort',
    programYear
  });

  let school = EmberObject.create({
    id: 1,
    cohorts: resolve([cohort])
  });
  let students = [
    EmberObject.create({
      id: 1,
      fullName: 'test person',
      email: 'tstemail',
      campusId: 'id123'
    }),
    EmberObject.create({
      id: 2,
      fullName: 'second person',
      email: '2nd@.com',
      campusId: '123ID'
    })
  ];

  storeMock.reopen({
    query(what, {filters, limit}){

      assert.equal('cohort', what);
      assert.equal(1000, limit);
      assert.equal(1, filters.schools[0]);
      return resolve([cohort]);
    }
  });

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
  let school = EmberObject.create({
    id: 1,
    cohorts: resolve([])
  });
  let students = [
    EmberObject.create({
      id: 1,
      fullName: 'test person',
      email: 'tstemail',
      campusId: 'id123'
    })
  ];

  storeMock.reopen({
    query(){
      return resolve([]);
    }
  });

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
  const checkAll = 'thead tr:eq(0) input';
  const firstStudent = 'tbody tr:eq(0) td:eq(0) input';

  return wait().then(() => {
    assert.notOk(this.$(firstStudent).prop('checked'));
    this.$(checkAll).click();
    return wait().then(() => {
      assert.ok(this.$(firstStudent).prop('checked'));
    });
  });

});

test('check some sets indeterminate state', function(assert) {
  let school = EmberObject.create({
    id: 1,
    cohorts: resolve([])
  });
  let students = [
    EmberObject.create({
      id: 1,
      fullName: 'test person',
      email: 'tstemail',
      campusId: 'id123'
    }),
    EmberObject.create({
      id: 2,
      fullName: 'test person2',
      email: 'tstemail2',
      campusId: 'id1232'
    }),
  ];

  storeMock.reopen({
    query(){
      return resolve([]);
    }
  });

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
  const checkAll = 'thead tr:eq(0) input';
  const firstStudent = 'tbody tr:eq(0) td:eq(0) input';
  const secondStudent = 'tbody tr:eq(1) td:eq(0) input';

  return wait().then(() => {
    assert.notOk(this.$(checkAll).prop('checked'), 'check all is not initially checked');
    assert.notOk(this.$(checkAll).prop('indeterminate'), 'check all is not initially indeterminate');
    assert.notOk(this.$(firstStudent).prop('checked'), 'first student is not initiall checked');
    assert.notOk(this.$(secondStudent).prop('checked'), 'second student is not initiall checked');

    this.$(firstStudent).click();
    assert.ok(this.$(checkAll).prop('indeterminate'), 'check all is indeterminate with one student checked');
    this.$(secondStudent).click();
    assert.ok(this.$(checkAll).prop('checked'), 'check all is checked with both students checked');
  });
});

test('when some are selected check all checks all', function(assert) {
  let school = EmberObject.create({
    id: 1,
    cohorts: resolve([])
  });
  let students = [
    EmberObject.create({
      id: 1,
      fullName: 'test person',
      email: 'tstemail',
      campusId: 'id123'
    }),
    EmberObject.create({
      id: 2,
      fullName: 'test person2',
      email: 'tstemail2',
      campusId: 'id1232'
    }),
  ];

  storeMock.reopen({
    query(){
      return resolve([]);
    }
  });

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
  const checkAll = 'thead tr:eq(0) input';
  const firstStudent = 'tbody tr:eq(0) td:eq(0) input';
  const secondStudent = 'tbody tr:eq(1) td:eq(0) input';

  return wait().then(() => {
    assert.notOk(this.$(checkAll).prop('checked'), 'check all is not initially checked');
    assert.notOk(this.$(firstStudent).prop('checked'), 'first student is not initiall checked');
    assert.notOk(this.$(secondStudent).prop('checked'), 'second student is not initiall checked');

    this.$(firstStudent).click();
    this.$(checkAll).click();
    return wait().then(()=>{
      assert.ok(this.$(firstStudent).prop('checked'), 'first student still checked after checkall clicked');
      assert.ok(this.$(secondStudent).prop('checked'), 'second student checked after checkall clicked');
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
  let program = EmberObject.create({
    duration: 20,
    title: 'program title'
  });
  let programYear = EmberObject.create({
    program,
    startYear: 2020
  });
  let cohort = EmberObject.create({
    id: 1,
    title: 'test cohort',
    programYear
  });

  let school = EmberObject.create({
    id: 1,
    cohorts: resolve([cohort])
  });
  let students = [
    EmberObject.create({
      id: 1,
      fullName: 'test person',
      email: 'tstemail',
      campusId: 'id123',
      save(){
        assert.equal(this.get('primaryCohort'), cohort);
      }
    })
  ];

  storeMock.reopen({
    query(){
      return resolve([cohort]);
    }
  });

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
