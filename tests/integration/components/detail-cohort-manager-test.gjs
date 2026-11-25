import { array } from '@ember/helper';
import { render } from '@ember/test-helpers';
import DetailCohortManager from 'frontend/components/detail-cohort-manager';
import noop from 'frontend/helpers/noop';
import {
  setupAuthentication,
  setupRenderingTest,
  takeComponentScreenshot,
} from 'frontend/tests/helpers';
import { setupMSW } from 'frontend/tests/msw';
import { component } from 'frontend/tests/pages/components/detail-cohort-manager';
import { module, test } from 'qunit';

module('Integration | Component | detail cohort manager', function (hooks) {
  setupRenderingTest(hooks);
  setupMSW(hooks);

  hooks.beforeEach(async function () {
    const now = new Date();
    const school1 = await this.server.create('school');
    const school2 = await this.server.create('school');
    const program1 = await this.server.create('program', { school: school1 });
    const program2 = await this.server.create('program', { school: school2 });
    const programYear1 = await this.server.create('program-year', {
      program: program1,
      startYear: now.getFullYear(),
    });
    const programYear2 = await this.server.create('program-year', {
      program: program2,
      startYear: now.getFullYear(),
    });
    const cohort1 = await this.server.create('cohort', { programYear: programYear1 });
    const cohort2 = await this.server.create('cohort', { programYear: programYear2 });
    const course = await this.server.create('course', { school: school1 });
    await setupAuthentication({ school: school1, directedPrograms: [program1, program2] });

    const store = this.owner.lookup('service:store');
    this.course = await store.findRecord('course', course.id);
    this.cohort1 = await store.findRecord('cohort', cohort1.id);
    this.cohort2 = await store.findRecord('cohort', cohort2.id);
    this.school1 = school1;
    this.program1 = program1;
  });

  test('it renders', async function (assert) {
    this.set('course', this.course);
    await render(
      <template>
        <DetailCohortManager
          @course={{this.course}}
          @selectedCohorts={{(array)}}
          @add={{(noop)}}
          @remove={{(noop)}}
        />
      </template>,
    );
    await takeComponentScreenshot(assert);
    assert.ok(component.schoolFilter.isPresent);
    assert.notOk(component.programFilter.isPresent);
    assert.strictEqual(component.selectedCohorts.length, 0);
    assert.strictEqual(component.selectableCohorts.length, 1);
    assert.strictEqual(component.selectableCohorts[0].text, 'school 0 | program 0 | cohort 0');
  });

  test('it renders with no filter when only one school', async function (assert) {
    await setupAuthentication({ id: 1, school: this.school1, directedPrograms: [this.program1] });
    await render(
      <template>
        <DetailCohortManager
          @course={{this.course}}
          @selectedCohorts={{(array)}}
          @add={{(noop)}}
          @remove={{(noop)}}
        />
      </template>,
    );
    await takeComponentScreenshot(assert);
    assert.notOk(component.schoolFilter.isPresent);
    assert.strictEqual(component.selectableCohorts.length, 1);
  });

  test('school filter works', async function (assert) {
    this.set('course', this.course);
    await render(
      <template>
        <DetailCohortManager
          @course={{this.course}}
          @selectedCohorts={{(array)}}
          @add={{(noop)}}
          @remove={{(noop)}}
        />
      </template>,
    );
    assert.strictEqual(component.selectableCohorts.length, 1);
    assert.strictEqual(component.selectableCohorts[0].text, 'school 0 | program 0 | cohort 0');
    await component.schoolFilter.select(2);
    assert.strictEqual(component.selectableCohorts.length, 1);
    assert.strictEqual(component.selectableCohorts[0].text, 'school 1 | program 1 | cohort 1');
  });

  test('program filter works', async function (assert) {
    const now = new Date();
    const program3 = await this.server.create('program', { school: this.school1 });
    const programYear3 = await this.server.create('program-year', {
      program: program3,
      startYear: now.getFullYear(),
    });
    await this.server.create('cohort', { programYear: programYear3 });
    await setupAuthentication({
      // different user than beforeEach hook to force school choice for this test
      id: 1,
      school: this.school1,
      directedPrograms: [this.program1, program3],
    });

    await render(
      <template>
        <DetailCohortManager
          @course={{this.course}}
          @selectedCohorts={{(array)}}
          @add={{(noop)}}
          @remove={{(noop)}}
        />
      </template>,
    );

    assert.notOk(component.schoolFilter.isPresent);
    assert.ok(component.programFilter.isPresent);
    assert.strictEqual(component.selectableCohorts.length, 1);
    assert.strictEqual(component.selectableCohorts[0].text, 'school 0 | program 0 | cohort 0');
    await component.programFilter.select(program3.id);
    assert.strictEqual(component.selectableCohorts.length, 1);
    assert.strictEqual(component.selectableCohorts[0].text, 'school 0 | program 2 | cohort 2');
  });

  test('selected cohorts', async function (assert) {
    this.set('course', this.course);
    this.set('selectedCohorts', [this.cohort2]);
    await render(
      <template>
        <DetailCohortManager
          @course={{this.course}}
          @selectedCohorts={{this.selectedCohorts}}
          @add={{(noop)}}
          @remove={{(noop)}}
        />
      </template>,
    );
    assert.strictEqual(component.selectedCohorts.length, 1);
    assert.strictEqual(component.selectedCohorts[0].text, 'school 1 | program 1 | cohort 1');
    assert.strictEqual(component.selectableCohorts.length, 1);
    assert.strictEqual(component.selectableCohorts[0].text, 'school 0 | program 0 | cohort 0');
  });

  test('add', async function (assert) {
    this.set('course', this.course);
    this.set('add', (cohort) => {
      assert.strictEqual(cohort, this.cohort1);
    });
    await render(
      <template>
        <DetailCohortManager
          @course={{this.course}}
          @selectedCohorts={{this.selectedCohorts}}
          @add={{this.add}}
          @remove={{(noop)}}
        />
      </template>,
    );
    await component.selectableCohorts[0].add();
  });

  test('remove', async function (assert) {
    this.set('course', this.course);
    this.set('selectedCohorts', [this.cohort1]);
    this.set('remove', (cohort) => {
      assert.strictEqual(cohort, this.cohort1);
    });
    await render(
      <template>
        <DetailCohortManager
          @course={{this.course}}
          @selectedCohorts={{this.selectedCohorts}}
          @add={{(noop)}}
          @remove={{this.remove}}
        />
      </template>,
    );
    await component.selectedCohorts[0].remove();
  });
});
