import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render, waitFor } from '@ember/test-helpers';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import { component } from 'frontend/tests/pages/components/program-year/visualize-objectives';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import VisualizeObjectives from 'frontend/components/program-year/visualize-objectives';

module('Integration | Component | program-year/visualize-objectives', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function (assert) {
    const school = this.server.create('school');
    const competency = this.server.create('competency', { school });
    const program = this.server.create('program');
    const programYear = this.server.create('program-year', {
      program,
      competencies: [competency],
    });
    const cohort = this.server.create('cohort', {
      programYear,
      title: 'Class of 2022',
    });
    const course = this.server.create('course', {
      school,
      cohorts: [cohort],
    });
    const sessions = this.server.createList('session', 3, {
      course,
    });
    const sessionObjective1 = this.server.create('session-objective', {
      session: sessions[0],
    });
    const sessionObjective2 = this.server.create('session-objective', {
      session: sessions[1],
    });
    const sessionObjective3 = this.server.create('session-objective', {
      session: sessions[2],
    });
    const courseObjective1 = this.server.create('course-objective', {
      course,
      sessionObjectives: [sessionObjective1],
    });
    const courseObjective2 = this.server.create('course-objective', {
      course,
      sessionObjectives: [sessionObjective2],
    });
    const courseObjective3 = this.server.create('course-objective', {
      course,
      sessionObjectives: [sessionObjective3],
    });
    this.server.create('program-year-objective', {
      programYear,
      competency,
      courseObjectives: [courseObjective1],
    });
    this.server.create('program-year-objective', {
      programYear,
      competency,
      courseObjectives: [courseObjective2],
    });
    this.server.create('program-year-objective', {
      programYear,
      competency,
      courseObjectives: [courseObjective3],
    });
    const programYearModel = await this.owner
      .lookup('service:store')
      .findRecord('program-year', programYear.id);
    this.set('model', programYearModel);
    await render(<template><VisualizeObjectives @model={{this.model}} /></template>);
    assert.strictEqual(component.title.text, 'program 0 Class of 2022');
    assert.strictEqual(component.title.link, '/programs/1/programyears/1');
    assert.strictEqual(component.breadcrumb.crumbs.length, 2);
    assert.strictEqual(component.breadcrumb.crumbs[0].text, 'program 0 Class of 2022');
    assert.strictEqual(component.breadcrumb.crumbs[0].link, '/programs/1/programyears/1');
    assert.strictEqual(component.breadcrumb.crumbs[1].text, 'Objectives');
    assert.notOk(component.treeChart.isIcon);
    await waitFor('.loaded');
    await waitFor('svg .links');
    await waitFor('svg .nodes');
    // @todo page objects aren't playing ball here. figure out why. using qunit-dom in the mean time. [ST 2022/09/01]
    // assert.strictEqual(component.treeChart.chart.links.length, 10);
    // assert.strictEqual(component.treeChart.chart.nodes.length, 11);
    assert.dom('svg .links .link').exists({ count: 10 });
    assert.dom('svg .nodes .node').exists({ count: 11 });
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });
});
