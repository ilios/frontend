import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { component } from 'ilios/tests/pages/components/assign-students';

module('Integration | Component | assign students', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  test('it renders', async function (assert) {
    const school = this.server.create('school');
    const program = this.server.create('program', {
      duration: 20,
      title: 'program title',
      school,
    });
    const programYear = this.server.create('programYear', {
      program,
      startYear: 2020,
    });
    this.server.create('cohort', {
      title: 'test cohort',
      programYear,
    });
    this.server.create('user', {
      id: 1,
      email: 'tstemail',
      campusId: 'id123',
    });
    this.server.create('user', {
      id: 2,
      email: '2nd@.com',
      campusId: '123ID',
      displayName: 'Aardvark',
    });
    const schoolModel = await this.owner.lookup('service:store').find('school', school.id);
    const students = await this.owner.lookup('service:store').findAll('user');

    this.set('school', schoolModel);
    this.set('students', students);
    await render(hbs`<AssignStudents
      @students={{this.students}}
      @school={{this.school}}
      @offset={{0}}
      @limit={{10}}
      @setOffset={{(noop)}}
      @setLimit={{(noop)}}
    />`);

    assert.strictEqual(component.cohorts.options.length, 1);
    assert.strictEqual(component.cohorts.options[0].text, 'program title test cohort');
    assert.strictEqual(component.students.length, 2);
    assert.strictEqual(component.students[0].name.userNameInfo.fullName, '0 guy M. Mc0son');
    assert.notOk(component.students[0].name.userNameInfo.hasAdditionalInfo);
    assert.strictEqual(component.students[1].name.userNameInfo.fullName, 'Aardvark');
    assert.ok(component.students[1].name.userNameInfo.hasAdditionalInfo);
  });

  test('check all checks all', async function (assert) {
    const school = this.server.create('school');
    this.server.create('user', {
      id: 1,
      email: 'tstemail',
      campusId: 'id123',
    });
    const schoolModel = await this.owner.lookup('service:store').find('school', school.id);
    const students = await this.owner.lookup('service:store').findAll('user');

    this.set('school', schoolModel);
    this.set('students', students);

    await render(hbs`<AssignStudents
      @students={{this.students}}
      @school={{this.school}}
      @offset={{0}}
      @limit={{10}}
      @setOffset={{(noop)}}
      @setLimit={{(noop)}}
    />`);
    assert.notOk(component.isToggleAllChecked);
    assert.notOk(component.students[0].isToggleChecked);
    await component.toggleAll();
    assert.notOk(component.students[0].isChecked);
  });

  test('check some sets indeterminate state', async function (assert) {
    const school = this.server.create('school');
    this.server.create('user', {
      id: 1,
      email: 'tstemail',
      campusId: 'id123',
    });
    this.server.create('user', {
      id: 2,
      email: '2nd@.com',
      campusId: '123ID',
    });
    const schoolModel = await this.owner.lookup('service:store').find('school', school.id);
    const students = await this.owner.lookup('service:store').findAll('user');

    this.set('school', schoolModel);
    this.set('students', students);

    await render(hbs`<AssignStudents
      @students={{this.students}}
      @school={{this.school}}
      @offset={{0}}
      @limit={{10}}
      @setOffset={{(noop)}}
      @setLimit={{(noop)}}
    />`);

    assert.notOk(component.isToggleAllChecked, 'check all is not initially checked');
    assert.notOk(component.isToggleAllIndeterminate, 'check all is not initially indeterminate');
    assert.notOk(
      component.students[0].isToggleAllChecked,
      'first student is not initially checked'
    );
    assert.notOk(
      component.students[1].isToggleAllChecked,
      'second student is not initially checked'
    );
    await component.students[0].toggle();
    assert.ok(
      component.isToggleAllIndeterminate,
      'check all is indeterminate with one student checked'
    );
    await component.students[1].toggle();
    assert.ok(component.isToggleAllChecked, 'check all is checked with both students checked');
  });

  test('when some are selected check all checks all', async function (assert) {
    const school = this.server.create('school');
    this.server.create('user', {
      id: 1,
      email: 'tstemail',
      campusId: 'id123',
    });
    this.server.create('user', {
      id: 2,
      email: '2nd@.com',
      campusId: '123ID',
    });
    const schoolModel = await this.owner.lookup('service:store').find('school', school.id);
    const students = await this.owner.lookup('service:store').findAll('user');

    this.set('school', schoolModel);
    this.set('students', students);

    await render(hbs`<AssignStudents
      @students={{this.students}}
      @school={{this.school}}
      @offset={{0}}
      @limit={{10}}
      @setOffset={{(noop)}}
      @setLimit={{(noop)}}
    />`);
    assert.notOk(component.isToggleAllChecked, 'check all is not initially checked');
    assert.notOk(component.students[0].isToggleChecked, 'first student is not initially checked');
    assert.notOk(component.students[1].isToggleChecked, 'second student is not initially checked');

    await component.students[0].toggle();
    await component.toggleAll();
    assert.ok(
      component.students[0].isToggleChecked,
      'first student still checked after checkall clicked'
    );
    assert.ok(
      component.students[1].isToggleChecked,
      'second student checked after checkall clicked'
    );
  });

  test('save sets primary cohort', async function (assert) {
    const school = this.server.create('school');
    const program = this.server.create('program', {
      duration: 20,
      title: 'program title',
      school,
    });
    const programYear = this.server.create('programYear', {
      program,
      startYear: 2020,
    });
    this.server.create('cohort', {
      id: 1,
      title: 'test cohort',
      programYear,
    });

    this.server.create('user', {
      id: 1,
      email: 'tstemail',
      campusId: 'id123',
    });
    const schoolModel = await this.owner.lookup('service:store').find('school', school.id);
    const students = await this.owner.lookup('service:store').findAll('user');

    this.set('school', schoolModel);
    this.set('students', students);

    await render(hbs`<AssignStudents
      @students={{this.students}}
      @school={{this.school}}
      @offset={{0}}
      @limit={{10}}
      @setOffset={{(noop)}}
      @setLimit={{(noop)}}
    />`);

    assert.strictEqual(this.server.db.users[0].primaryCohortId, null);
    await component.toggleAll();
    await component.save();
    assert.strictEqual(parseInt(this.server.db.users[0].primaryCohortId, 10), 1);
  });
});
