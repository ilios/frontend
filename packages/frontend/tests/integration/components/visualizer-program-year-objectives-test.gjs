import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render, waitFor } from '@ember/test-helpers';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import VisualizerProgramYearObjectives from 'frontend/components/visualizer-program-year-objectives';

module('Integration | Component | visualizer-program-year-objectives', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function (assert) {
    const domain1 = this.server.create('competency');
    const domain2 = this.server.create('competency');
    const competency1 = this.server.create('competency', {
      parent: domain1,
    });
    const competency2 = this.server.create('competency', {
      parent: domain2,
    });
    const competency3 = this.server.create('competency', {
      parent: domain1,
    });
    const program = this.server.create('program');
    const programYear = this.server.create('program-year', {
      program,
      competencies: [competency1, competency2, competency3],
    });
    const cohort = this.server.create('cohort', {
      programYear,
    });
    const programYearObjective1 = this.server.create('program-year-objective', {
      programYear,
      competency: competency1,
    });
    const programYearObjective2 = this.server.create('program-year-objective', {
      programYear,
      competency: competency2,
    });
    const programYearObjective3 = this.server.create('program-year-objective', {
      programYear,
      competency: competency3,
    });
    const programYearObjective4 = this.server.create('program-year-objective', {
      programYear,
      competency: competency1,
    });
    const course = this.server.create('course', {
      cohorts: [cohort],
    });
    const courseObjective1 = this.server.create('course-objective', {
      course,
      programYearObjectives: [programYearObjective1],
    });
    const courseObjective2 = this.server.create('course-objective', {
      course,
      programYearObjectives: [programYearObjective2, programYearObjective3],
    });
    this.server.create('course-objective', {
      course,
      programYearObjectives: [programYearObjective4],
    });
    const session = this.server.create('session', {
      course,
    });
    this.server.create('session-objective', {
      session,
      courseObjectives: [courseObjective1],
    });
    this.server.create('session-objective', {
      session,
      courseObjectives: [courseObjective2],
    });
    const programYearModel = await this.owner
      .lookup('service:store')
      .findRecord('program-year', programYear.id);
    this.set('programYear', programYearModel);
    await render(
      <template><VisualizerProgramYearObjectives @programYear={{this.programYear}} /></template>,
    );

    await waitFor('svg.loaded');
    await waitFor('svg .links');
    await waitFor('svg .nodes');
    assert.dom('svg').exists({ count: 1 });
    assert.dom('svg g.links').exists({ count: 1 });
    assert.dom('svg g.nodes').exists({ count: 1 });
    assert.dom('svg g.links line').exists({ count: 13 });
    assert.dom('svg g.nodes circle').exists({ count: 14 });
  });
});
