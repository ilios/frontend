import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { setupMirage } from 'test-app/tests/test-support/mirage';
import DetailCohorts from 'ilios-common/components/detail-cohorts';
import { component } from 'ilios-common/page-objects/components/detail-cohorts';

module('Integration | Component | detail cohorts', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('objective linkage is removed when cohort is removed', async function (assert) {
    const school1 = this.server.create('school');
    const school2 = this.server.create('school');
    const program1 = this.server.create('program', { school: school1 });
    const program2 = this.server.create('program', { school: school2 });
    const programYear1 = this.server.create('program-year', { program: program1 });
    const programYear2 = this.server.create('program-year', { program: program2 });
    const cohort1 = this.server.create('cohort', { programYear: programYear1 });
    const cohort2 = this.server.create('cohort', { programYear: programYear2 });
    const course = this.server.create('course', { school: school1, cohorts: [cohort1, cohort2] });
    const programYearObjective1a = this.server.create('program-year-objective', {
      programYear: programYear1,
    });
    const programYearObjective1b = this.server.create('program-year-objective', {
      programYear: programYear1,
    });
    const programYearObjective2 = this.server.create('program-year-objective', {
      programYear: programYear2,
    });
    const courseObjective1 = this.server.create('course-objective', {
      course,
      programYearObjectives: [programYearObjective1a, programYearObjective2],
    });
    const courseObjective2 = this.server.create('course-objective', {
      course,
      programYearObjectives: [programYearObjective1b, programYearObjective2],
    });

    const store = this.owner.lookup('service:store');
    const courseModel = await store.findRecord('course', course.id);
    const programYearObjectiveModel1a = await store.findRecord(
      'program-year-objective',
      programYearObjective1a.id,
    );
    const programYearObjectiveModel1b = await store.findRecord(
      'program-year-objective',
      programYearObjective1b.id,
    );
    const programYearObjectiveModel2 = await store.findRecord(
      'program-year-objective',
      programYearObjective2.id,
    );
    const courseObjectiveModel1 = await store.findRecord('course-objective', courseObjective1.id);
    const courseObjectiveModel2 = await store.findRecord('course-objective', courseObjective2.id);

    // sanity check - verify that course and program-year objectives are linked up correctly.
    let linkedProgramYearObjectives1 = await courseObjectiveModel1.programYearObjectives;
    let linkedProgramYearObjectives2 = await courseObjectiveModel2.programYearObjectives;
    assert.strictEqual(linkedProgramYearObjectives1.length, 2);
    assert.ok(linkedProgramYearObjectives1.includes(programYearObjectiveModel1a));
    assert.ok(linkedProgramYearObjectives1.includes(programYearObjectiveModel2));
    assert.strictEqual(linkedProgramYearObjectives2.length, 2);
    assert.ok(linkedProgramYearObjectives2.includes(programYearObjectiveModel1b));
    assert.ok(linkedProgramYearObjectives2.includes(programYearObjectiveModel2));

    this.set('course', courseModel);
    await render(<template><DetailCohorts @course={{this.course}} @editable={{true}} /></template>);
    assert.strictEqual(component.list.cohorts.length, 2);
    await component.manage();
    assert.strictEqual(component.manager.selectedCohorts.length, 2);
    assert.strictEqual(
      component.manager.selectedCohorts[0].text,
      'school 0 | program 0 | cohort 0',
    );
    await component.manager.selectedCohorts[0].remove();
    await component.save();

    // verify that the program-year objectives associated with the removed cohort have been unlinked.
    linkedProgramYearObjectives1 = await courseObjectiveModel1.programYearObjectives;
    linkedProgramYearObjectives2 = await courseObjectiveModel2.programYearObjectives;
    assert.strictEqual(linkedProgramYearObjectives1.length, 1);
    assert.ok(linkedProgramYearObjectives1.includes(programYearObjectiveModel2));
    assert.strictEqual(linkedProgramYearObjectives2.length, 1);
    assert.ok(linkedProgramYearObjectives2.includes(programYearObjectiveModel2));
  });
});
