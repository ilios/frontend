import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import { component } from 'frontend/tests/pages/components/assign-students/manager';
import { DateTime } from 'luxon';
import Manager from 'frontend/components/assign-students/manager';
import { array } from '@ember/helper';
import noop from 'ilios-common/helpers/noop';

module('Integration | Component | assign-students/manager', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const thisYear = DateTime.now().year;
    const school1 = this.server.create('school');
    const school2 = this.server.create('school');
    const program = this.server.create('program', { school: school1 });
    const programYear1 = this.server.create('program-year', {
      program,
      startYear: thisYear,
    });
    const programYear2 = this.server.create('program-year', {
      program,
      startYear: thisYear + 1,
    });
    const programYear3 = this.server.create('program-year', {
      program,
      startYear: thisYear + 2,
    });
    this.server.create('cohort', {
      programYear: programYear1,
    });
    this.server.create('cohort', {
      programYear: programYear2,
    });
    this.server.create('cohort', {
      programYear: programYear3,
    });
    const user1 = this.server.create('user', {
      school: school1,
      displayName: 'Alpha',
    });
    const user2 = this.server.create('user', {
      school: school1,
      displayName: 'Beta',
    });
    const user3 = this.server.create('user', {
      school: school1,
      displayName: 'Gamma',
    });
    const user4 = this.server.create('user', {
      school: school2,
      displayName: 'Eins',
    });
    const user5 = this.server.create('user', {
      school: school2,
      displayName: 'Zwei',
    });

    const store = this.owner.lookup('service:store');
    this.school1 = await store.findRecord('school', school1.id);
    this.school2 = await store.findRecord('school', school2.id);
    this.user1 = await store.findRecord('user', user1.id);
    this.user2 = await store.findRecord('user', user2.id);
    this.user3 = await store.findRecord('user', user3.id);
    this.user4 = await store.findRecord('user', user4.id);
    this.user5 = await store.findRecord('user', user5.id);
    // ensure that the store is pre-populated with programs, program-years, and cohorts
    await store.findAll('program');
    await store.findAll('program-year');
    await store.findAll('cohort');
  });

  test('it renders with users', async function (assert) {
    this.set('school', this.school1);
    this.set('selectableStudents', [this.user1, this.user2, this.user3]);
    await render(
      <template>
        <Manager
          @school={{this.school}}
          @selectableStudents={{this.selectableStudents}}
          @selectedStudents={{(array)}}
          @changeUserSelection={{(noop)}}
          @changeAllUserSelections={{(noop)}}
          @save={{(noop)}}
          @isSaving={{false}}
        />
      </template>,
    );
    assert.strictEqual(component.cohorts.label, 'Assign 0 selected users to:');
    assert.notOk(component.cohorts.isDisabled);
    assert.strictEqual(component.cohorts.options.length, 3);
    assert.strictEqual(component.cohorts.options[0].text, 'program 0 cohort 0');
    assert.strictEqual(component.cohorts.options[1].text, 'program 0 cohort 1');
    assert.strictEqual(component.cohorts.options[2].text, 'program 0 cohort 2');
    assert.notOk(component.cohorts.options[0].isSelected);
    assert.notOk(component.cohorts.options[1].isSelected);
    assert.ok(component.cohorts.options[2].isSelected);
    assert.notOk(component.isToggleAllDisabled);
    assert.strictEqual(component.students.length, 3);
    assert.strictEqual(component.students[0].userNameInfo.fullName, 'Alpha');
    assert.strictEqual(component.students[1].userNameInfo.fullName, 'Beta');
    assert.strictEqual(component.students[2].userNameInfo.fullName, 'Gamma');
    assert.notOk(component.students[0].isToggleDisabled);
    assert.notOk(component.students[1].isToggleDisabled);
    assert.notOk(component.students[2].isToggleDisabled);
    assert.notOk(component.noResult.isVisible);
  });

  test('it renders without users', async function (assert) {
    this.set('school', this.school1);
    await render(
      <template>
        <Manager
          @school={{this.school}}
          @selectableStudents={{(array)}}
          @selectedStudents={{(array)}}
          @changeUserSelection={{(noop)}}
          @changeAllUserSelections={{(noop)}}
          @save={{(noop)}}
          @isSaving={{false}}
        />
      </template>,
    );
    assert.strictEqual(component.students.length, 0);
    assert.ok(component.isToggleAllDisabled);
    assert.ok(component.noResult.isVisible);
    assert.strictEqual(component.noResult.text, 'No results found. Please try again.');
    assert.ok(component.isSaveDisabled);
  });

  test('it renders without selectable cohorts', async function (assert) {
    this.set('school', this.school2);
    this.set('selectableStudents', [this.user4, this.user5]);
    await render(
      <template>
        <Manager
          @school={{this.school}}
          @selectableStudents={{this.selectableStudents}}
          @selectedStudents={{(array)}}
          @changeUserSelection={{(noop)}}
          @changeAllUserSelections={{(noop)}}
          @save={{(noop)}}
          @isSaving={{false}}
        />
      </template>,
    );
    assert.ok(component.cohorts.noCohorts.isVisible);
    assert.strictEqual(
      component.cohorts.noCohorts.text,
      'There are no cohorts available for student assignment in this school.',
    );
    assert.ok(component.isToggleAllDisabled);
    assert.strictEqual(component.students.length, 2);
    assert.strictEqual(component.students[0].userNameInfo.fullName, 'Eins');
    assert.strictEqual(component.students[1].userNameInfo.fullName, 'Zwei');
    assert.ok(component.students[0].isToggleDisabled);
    assert.ok(component.students[1].isToggleDisabled);
  });

  test('select user', async function (assert) {
    this.set('school', this.school1);
    this.set('selectableStudents', [this.user1]);
    this.set('changeUser', (userId) => {
      assert.step('changeUser called');
      assert.strictEqual(userId, this.user1.id);
    });
    await render(
      <template>
        <Manager
          @school={{this.school}}
          @selectableStudents={{this.selectableStudents}}
          @selectedStudents={{(array)}}
          @changeUserSelection={{this.changeUser}}
          @changeAllUserSelections={{(noop)}}
          @save={{(noop)}}
          @isSaving={{false}}
        />
      </template>,
    );
    assert.strictEqual(component.students.length, 1);
    assert.strictEqual(component.students[0].userNameInfo.fullName, 'Alpha');
    assert.notOk(component.students[0].isToggleDisabled);
    assert.notOk(component.students[0].isToggleChecked);
    await component.students[0].toggle();
    assert.verifySteps(['changeUser called']);
  });

  test('de-select user', async function (assert) {
    this.set('school', this.school1);
    this.set('selectableStudents', [this.user1]);
    this.set('selectedStudents', [this.user1]);
    this.set('changeUser', (userId) => {
      assert.step('changeUser called');
      assert.strictEqual(userId, this.user1.id);
    });
    await render(
      <template>
        <Manager
          @school={{this.school}}
          @selectableStudents={{this.selectableStudents}}
          @selectedStudents={{this.selectableStudents}}
          @changeUserSelection={{this.changeUser}}
          @changeAllUserSelections={{(noop)}}
          @save={{(noop)}}
          @isSaving={{false}}
        />
      </template>,
    );
    assert.strictEqual(component.students.length, 1);
    assert.strictEqual(component.students[0].userNameInfo.fullName, 'Alpha');
    assert.notOk(component.students[0].isToggleDisabled);
    assert.ok(component.students[0].isToggleChecked);
    await component.students[0].toggle();
    assert.verifySteps(['changeUser called']);
  });

  test('toggle all', async function (assert) {
    this.set('school', this.school1);
    this.set('selectableStudents', [this.user1]);
    this.set('toggleAll', () => {
      assert.step('toggleAll called');
    });
    await render(
      <template>
        <Manager
          @school={{this.school}}
          @selectableStudents={{this.selectableStudents}}
          @selectedStudents={{(array)}}
          @changeUserSelection={{(noop)}}
          @changeAllUserSelections={{this.toggleAll}}
          @save={{(noop)}}
          @isSaving={{false}}
        />
      </template>,
    );
    assert.notOk(component.isToggleAllDisabled);
    await component.toggleAll();
    assert.verifySteps(['toggleAll called']);
  });

  test('all users are selected', async function (assert) {
    this.set('school', this.school1);
    this.set('selectableStudents', [this.user1, this.user2]);
    this.set('selectedStudents', [this.user1, this.user2]);
    await render(
      <template>
        <Manager
          @school={{this.school}}
          @selectableStudents={{this.selectableStudents}}
          @selectedStudents={{this.selectedStudents}}
          @changeUserSelection={{(noop)}}
          @changeAllUserSelections={{(noop)}}
          @save={{(noop)}}
          @isSaving={{false}}
        />
      </template>,
    );
    assert.strictEqual(component.cohorts.label, 'Assign 2 selected users to:');
    assert.notOk(component.isToggleAllDisabled);
    assert.ok(component.isToggleAllChecked);
    assert.notOk(component.isToggleAllIndeterminate);
    assert.notOk(component.isSaveDisabled);
  });

  test('some users are selected', async function (assert) {
    this.set('school', this.school1);
    this.set('selectableStudents', [this.user1, this.user2]);
    this.set('selectedStudents', [this.user1]);
    await render(
      <template>
        <Manager
          @school={{this.school}}
          @selectableStudents={{this.selectableStudents}}
          @selectedStudents={{this.selectedStudents}}
          @changeUserSelection={{(noop)}}
          @changeAllUserSelections={{(noop)}}
          @save={{(noop)}}
          @isSaving={{false}}
        />
      </template>,
    );
    assert.strictEqual(component.cohorts.label, 'Assign 1 selected user to:');
    assert.notOk(component.isToggleAllDisabled);
    assert.notOk(component.isToggleAllChecked);
    assert.ok(component.isToggleAllIndeterminate);
    assert.notOk(component.isSaveDisabled);
  });

  test('no users are selected', async function (assert) {
    this.set('school', this.school1);
    this.set('selectableStudents', [this.user1, this.user2]);
    await render(
      <template>
        <Manager
          @school={{this.school}}
          @selectableStudents={{this.selectableStudents}}
          @selectedStudents={{(array)}}
          @changeUserSelection={{(noop)}}
          @changeAllUserSelections={{(noop)}}
          @save={{(noop)}}
          @isSaving={{false}}
        />
      </template>,
    );
    assert.strictEqual(component.cohorts.label, 'Assign 0 selected users to:');
    assert.notOk(component.isToggleAllDisabled);
    assert.notOk(component.isToggleAllChecked);
    assert.notOk(component.isToggleAllIndeterminate);
    assert.ok(component.isSaveDisabled);
  });

  test('user selections persist across cohort changes', async function (assert) {
    this.set('school', this.school1);
    this.set('selectableStudents', [this.user1, this.user2, this.user3]);
    this.set('selectedStudents', [this.user2]);
    await render(
      <template>
        <Manager
          @school={{this.school}}
          @selectableStudents={{this.selectableStudents}}
          @selectedStudents={{this.selectedStudents}}
          @changeUserSelection={{(noop)}}
          @changeAllUserSelections={{(noop)}}
          @save={{(noop)}}
          @isSaving={{false}}
        />
      </template>,
    );
    assert.strictEqual(component.cohorts.label, 'Assign 1 selected user to:');
    assert.strictEqual(component.cohorts.options.length, 3);
    assert.strictEqual(component.cohorts.options[0].text, 'program 0 cohort 0');
    assert.strictEqual(component.cohorts.options[1].text, 'program 0 cohort 1');
    assert.strictEqual(component.cohorts.options[2].text, 'program 0 cohort 2');
    assert.notOk(component.cohorts.options[0].isSelected);
    assert.notOk(component.cohorts.options[1].isSelected);
    assert.ok(component.cohorts.options[2].isSelected);
    assert.strictEqual(component.students.length, 3);
    assert.strictEqual(component.students[0].userNameInfo.fullName, 'Alpha');
    assert.strictEqual(component.students[1].userNameInfo.fullName, 'Beta');
    assert.strictEqual(component.students[2].userNameInfo.fullName, 'Gamma');
    assert.notOk(component.students[0].isToggleChecked);
    assert.ok(component.students[1].isToggleChecked);
    assert.notOk(component.students[2].isToggleChecked);
    await component.cohorts.select('1');
    assert.ok(component.cohorts.options[0].isSelected);
    assert.notOk(component.cohorts.options[1].isSelected);
    assert.notOk(component.cohorts.options[2].isSelected);
    assert.notOk(component.students[0].isToggleChecked);
    assert.ok(component.students[1].isToggleChecked);
    assert.notOk(component.students[2].isToggleChecked);
  });

  test('save', async function (assert) {
    this.set('school', this.school1);
    this.set('selectableStudents', [this.user1]);
    this.set('selectedStudents', [this.user1]);
    this.set('save', () => {
      assert.step('save called');
    });
    await render(
      <template>
        <Manager
          @school={{this.school}}
          @selectableStudents={{this.selectableStudents}}
          @selectedStudents={{this.selectedStudents}}
          @changeUserSelection={{(noop)}}
          @changeAllUserSelections={{(noop)}}
          @save={{this.save}}
          @isSaving={{false}}
        />
      </template>,
    );
    assert.notOk(component.isSaveDisabled);
    await component.save();
    assert.verifySteps(['save called']);
  });

  test('controls are locked during saving', async function (assert) {
    this.set('school', this.school1);
    this.set('selectableStudents', [this.user1]);
    this.set('selectedStudents', [this.user1]);
    await render(
      <template>
        <Manager
          @school={{this.school}}
          @selectableStudents={{this.selectableStudents}}
          @selectedStudents={{this.selectedStudents}}
          @changeUserSelection={{(noop)}}
          @changeAllUserSelections={{(noop)}}
          @save={{(noop)}}
          @isSaving={{true}}
        />
      </template>,
    );
    assert.ok(component.isSaveDisabled);
    assert.ok(component.cohorts.isDisabled);
    assert.ok(component.isToggleAllDisabled);
    assert.ok(component.students[0].isToggleDisabled);
  });
});
