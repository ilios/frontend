import EmberObject from '@ember/object';
import { resolve } from 'rsvp';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled, find, click, findAll } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Integration | Component | assign students', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('nothing', function(assert){
    assert.ok(true);
  });

  test('it renders', async function(assert) {
    const school = this.server.create('school');
    const program = this.server.create('program', {
      duration: 20,
      title: 'program title',
      school
    });
    const programYear = this.server.create('programYear', {
      program,
      startYear: 2020
    });
    this.server.create('cohort', {
      title: 'test cohort',
      programYear
    });

    const students = [
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

    this.set('school', EmberObject.create(this.server.db.schools[0]));
    this.set('students', students);
    this.set('setOffset', ()=>{});
    this.set('setLimit', ()=>{});

    await render(hbs`{{assign-students
      students=students
      school=school
      offset=0
      limit=10
      setOffset=(action setOffset)
      setLimit=(action setLimit)
    }}`);

    let cohortOptions = findAll('select:nth-of-type(1) option');
    assert.equal(cohortOptions.length, 1);
    assert.equal(cohortOptions[0].textContent.trim(), 'program title test cohort');

    assert.equal(findAll('tbody tr').length, 2);
    assert.equal(findAll('tbody tr:nth-of-type(1) td')[1].textContent.trim(), 'test person');
    assert.equal(findAll('tbody tr:nth-of-type(2) td')[1].textContent.trim(), 'second person');
  });

  test('check all checks all', async function(assert) {
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

    this.set('school', school);
    this.set('students', students);
    this.set('setOffset', ()=>{});
    this.set('setLimit', ()=>{});

    await render(hbs`{{assign-students
      students=students
      school=school
      offset=0
      limit=10
      setOffset=(action setOffset)
      setLimit=(action setLimit)
    }}`);
    const checkAll = 'thead tr:nth-of-type(1) input';
    const firstStudent = 'tbody tr:nth-of-type(1) td:nth-of-type(1) input';

    assert.notOk(find(firstStudent).checked);
    await click(checkAll);
    assert.ok(find(firstStudent).checked);

  });

  test('check some sets indeterminate state', async function(assert) {
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

    this.set('school', school);
    this.set('students', students);
    this.set('setOffset', ()=>{});
    this.set('setLimit', ()=>{});

    await render(hbs`{{assign-students
      students=students
      school=school
      offset=0
      limit=10
      setOffset=(action setOffset)
      setLimit=(action setLimit)
    }}`);
    const checkAll = 'thead tr:nth-of-type(1) input';
    const firstStudent = 'tbody tr:nth-of-type(1) td:nth-of-type(1) input';
    const secondStudent = 'tbody tr:nth-of-type(2) td:nth-of-type(1) input';

    assert.notOk(find(checkAll).checked, 'check all is not initially checked');
    assert.notOk(find(checkAll).indeterminate, 'check all is not initially indeterminate');
    assert.notOk(find(firstStudent).checked, 'first student is not initiall checked');
    assert.notOk(find(secondStudent).checked, 'second student is not initiall checked');

    await click(firstStudent);
    assert.ok(find(checkAll).indeterminate, 'check all is indeterminate with one student checked');
    await click(secondStudent);
    await settled();
    assert.ok(find(checkAll).checked, 'check all is checked with both students checked');
  });

  test('when some are selected check all checks all', async function(assert) {
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

    this.set('school', school);
    this.set('students', students);
    this.set('setOffset', ()=>{});
    this.set('setLimit', ()=>{});

    await render(hbs`{{assign-students
      students=students
      school=school
      offset=0
      limit=10
      setOffset=(action setOffset)
      setLimit=(action setLimit)
    }}`);
    const checkAll = 'thead tr:nth-of-type(1) input';
    const firstStudent = 'tbody tr:nth-of-type(1) td:nth-of-type(1) input';
    const secondStudent = 'tbody tr:nth-of-type(2) td:nth-of-type(1) input';

    assert.notOk(find(checkAll).checked, 'check all is not initially checked');
    assert.notOk(find(firstStudent).checked, 'first student is not initiall checked');
    assert.notOk(find(secondStudent).checked, 'second student is not initiall checked');

    await click(firstStudent);
    await click(checkAll);
    assert.ok(find(firstStudent).checked, 'first student still checked after checkall clicked');
    assert.ok(find(secondStudent).checked, 'second student checked after checkall clicked');
  });

  test('save sets primary cohort', async function(assert) {
    const school = this.server.create('school');
    const program = this.server.create('program', {
      duration: 20,
      title: 'program title',
      school
    });
    const programYear = this.server.create('programYear', {
      program,
      startYear: 2020
    });
    this.server.create('cohort', {
      id: 1,
      title: 'test cohort',
      programYear
    });

    const students = [
      EmberObject.create({
        id: 1,
        fullName: 'test person',
        email: 'tstemail',
        campusId: 'id123',
        save() {
          assert.equal(this.primaryCohort.id, 1);
        }
      })
    ];

    this.set('school', EmberObject.create(this.server.db.schools[0]));
    this.set('students', students);
    this.set('setOffset', ()=>{});
    this.set('setLimit', ()=>{});

    await render(hbs`{{assign-students
      students=students
      school=school
      offset=0
      limit=10
      setOffset=(action setOffset)
      setLimit=(action setLimit)
    }}`);

    await click('thead th input');
    await click('button.done');
  });
});
