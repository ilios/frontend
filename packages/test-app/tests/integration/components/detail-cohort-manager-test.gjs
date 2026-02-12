import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { array } from '@ember/helper';
import { render } from '@ember/test-helpers';
import { setupMirage } from 'test-app/tests/test-support/mirage';
import DetailCohortManager from 'ilios-common/components/detail-cohort-manager';
import { component } from 'ilios-common/page-objects/components/detail-cohort-manager';
import { setupAuthentication } from 'ilios-common';
import noop from 'ilios-common/helpers/noop';

module('Integration | Component | detail cohort manager', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const now = new Date();
    const school1 = this.server.create('school');
    const school2 = this.server.create('school');
    const program1 = this.server.create('program', { school: school1 });
    const program2 = this.server.create('program', { school: school2 });
    const programYear1 = this.server.create('program-year', {
      program: program1,
      startYear: now.getFullYear(),
    });
    const programYear2 = this.server.create('program-year', {
      program: program2,
      startYear: now.getFullYear(),
    });
    const cohort1 = this.server.create('cohort', { programYear: programYear1 });
    const cohort2 = this.server.create('cohort', { programYear: programYear2 });
    const course = this.server.create('course', { school: school1 });
    await setupAuthentication({ school: school1, directedPrograms: [program1, program2] });

    const store = this.owner.lookup('service:store');
    this.course = await store.findRecord('course', course.id);
    this.cohort1 = await store.findRecord('cohort', cohort1.id);
    this.cohort2 = await store.findRecord('cohort', cohort2.id);
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
    assert.strictEqual(component.selectedCohorts.length, 0);
    assert.strictEqual(component.selectableCohorts.length, 2);
    assert.strictEqual(component.selectableCohorts[0].text, 'school 0 | program 0 | cohort 0');
    assert.strictEqual(component.selectableCohorts[1].text, 'school 1 | program 1 | cohort 1');
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
