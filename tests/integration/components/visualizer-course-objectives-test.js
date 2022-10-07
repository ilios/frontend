import { module, test } from 'qunit';
import { setupRenderingTest } from 'dummy/tests/helpers';
import { setupIntl } from 'ember-intl/test-support';
import { render, waitFor } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { component } from 'ilios-common/page-objects/components/visualizer-course-objectives';

module('Integration | Component | visualizer-course-objectives', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const course = this.server.create('course');
    const competencies = this.server.createList('competency', 3);
    const programYearObjective1 = this.server.create('programYearObjective', {
      competency: competencies[0],
    });
    const programYearObjective2 = this.server.create('programYearObjective', {
      competency: competencies[1],
    });
    const programYearObjective3 = this.server.create('programYearObjective', {
      competency: competencies[2],
    });
    const courseObjective1 = this.server.create('courseObjective', {
      course,
      programYearObjectives: [programYearObjective1],
    });
    const courseObjective2 = this.server.create('courseObjective', {
      course,
      programYearObjectives: [programYearObjective2],
    });
    const courseObjective3 = this.server.create('courseObjective', {
      course,
      programYearObjectives: [programYearObjective3],
    });
    const session1 = this.server.create('session', {
      title: 'Berkeley Investigations',
      course,
    });
    const session2 = this.server.create('session', {
      title: 'The San Leandro Horror',
      course,
    });
    const session3 = this.server.create('session', {
      title: 'Empty Session',
      course,
    });
    this.server.create('sessionObjective', {
      session: session1,
      courseObjectives: [courseObjective1],
    });
    this.server.create('sessionObjective', {
      session: session2,
      courseObjectives: [courseObjective2],
    });
    this.server.create('sessionObjective', {
      session: session3,
      courseObjectives: [courseObjective3],
    });

    this.server.create('offering', {
      session: session1,
      startDate: new Date('2019-12-08T12:00:00'),
      endDate: new Date('2019-12-08T17:00:00'),
    });
    this.server.create('offering', {
      session: session1,
      startDate: new Date('2019-12-21T12:00:00'),
      endDate: new Date('2019-12-21T17:30:00'),
    });
    this.server.create('offering', {
      session: session2,
      startDate: new Date('2019-12-05T18:00:00'),
      endDate: new Date('2019-12-05T21:00:00'),
    });

    this.course = await this.owner.lookup('service:store').findRecord('course', course.id);
  });

  test('it renders', async function (assert) {
    this.set('course', this.course);
    await render(
      hbs`<VisualizerCourseObjectives @course={{this.course}} @isIcon={{false}} @showDataTable={{true}} />`
    );
    //let the chart animations finish
    await waitFor('.loaded');
    await waitFor('svg .slice');

    assert.strictEqual(component.chart.slices.length, 2);
    assert.strictEqual(component.chart.slices[0].text, '77.8%');
    assert.strictEqual(component.chart.slices[1].text, '22.2%');
    assert.notOk(component.unlinkedObjectives.isPresent);
    assert.strictEqual(component.untaughtObjectives.items.length, 1);
    assert.strictEqual(component.untaughtObjectives.items[0].text, 'course objective 2');
    assert.strictEqual(component.dataTable.header.percentage.text, 'Percentage');
    assert.strictEqual(component.dataTable.header.objective.text, 'Course Objective');
    assert.strictEqual(component.dataTable.header.competency.text, 'Competency');
    assert.strictEqual(component.dataTable.header.sessions.text, 'Sessions');
    assert.strictEqual(component.dataTable.header.minutes.text, 'Minutes');
    assert.strictEqual(component.dataTable.rows.length, 3);
    assert.strictEqual(component.dataTable.rows[0].percentage, '77.8%');
    assert.strictEqual(component.dataTable.rows[0].objective, 'course objective 0');
    assert.strictEqual(component.dataTable.rows[0].competency, 'competency 0');
    assert.strictEqual(component.dataTable.rows[0].sessions.links.length, 1);
    assert.strictEqual(
      component.dataTable.rows[0].sessions.links[0].text,
      'Berkeley Investigations'
    );
    assert.strictEqual(component.dataTable.rows[0].sessions.links[0].url, '/courses/1/sessions/1');
    assert.strictEqual(component.dataTable.rows[0].minutes, '630');
    assert.strictEqual(component.dataTable.rows[1].percentage, '22.2%');
    assert.strictEqual(component.dataTable.rows[1].objective, 'course objective 1');
    assert.strictEqual(component.dataTable.rows[1].competency, 'competency 1');
    assert.strictEqual(component.dataTable.rows[1].sessions.links.length, 1);
    assert.strictEqual(
      component.dataTable.rows[1].sessions.links[0].text,
      'The San Leandro Horror'
    );
    assert.strictEqual(component.dataTable.rows[1].sessions.links[0].url, '/courses/1/sessions/2');
    assert.strictEqual(component.dataTable.rows[1].minutes, '180');
    assert.strictEqual(component.dataTable.rows[2].percentage, '0.0%');
    assert.strictEqual(component.dataTable.rows[2].objective, 'course objective 2');
    assert.strictEqual(component.dataTable.rows[2].competency, 'competency 2');
    assert.strictEqual(component.dataTable.rows[2].sessions.links.length, 1);
    assert.strictEqual(component.dataTable.rows[2].sessions.links[0].text, 'Empty Session');
    assert.strictEqual(component.dataTable.rows[2].sessions.links[0].url, '/courses/1/sessions/3');
    assert.strictEqual(component.dataTable.rows[2].minutes, '0');
  });

  test('sort data table by percentages', async function (assert) {
    this.set('course', this.course);
    await render(
      hbs`<VisualizerCourseObjectives @course={{this.course}} @isIcon={{false}} @showDataTable={{true}} />`
    );
    assert.strictEqual(component.dataTable.rows[0].percentage, '77.8%');
    assert.strictEqual(component.dataTable.rows[1].percentage, '22.2%');
    assert.strictEqual(component.dataTable.rows[2].percentage, '0.0%');
    await component.dataTable.header.percentage.toggle();
    assert.strictEqual(component.dataTable.rows[0].percentage, '0.0%');
    assert.strictEqual(component.dataTable.rows[1].percentage, '22.2%');
    assert.strictEqual(component.dataTable.rows[2].percentage, '77.8%');
    await component.dataTable.header.percentage.toggle();
    assert.strictEqual(component.dataTable.rows[0].percentage, '77.8%');
    assert.strictEqual(component.dataTable.rows[1].percentage, '22.2%');
    assert.strictEqual(component.dataTable.rows[2].percentage, '0.0%');
  });

  test('sort data-table by objectives', async function (assert) {
    this.set('course', this.course);
    await render(
      hbs`<VisualizerCourseObjectives @course={{this.course}} @isIcon={{false}} @showDataTable={{true}} />`
    );
    assert.strictEqual(component.dataTable.rows[0].objective, 'course objective 0');
    assert.strictEqual(component.dataTable.rows[1].objective, 'course objective 1');
    assert.strictEqual(component.dataTable.rows[2].objective, 'course objective 2');
    await component.dataTable.header.objective.toggle();
    assert.strictEqual(component.dataTable.rows[0].objective, 'course objective 0');
    assert.strictEqual(component.dataTable.rows[1].objective, 'course objective 1');
    assert.strictEqual(component.dataTable.rows[2].objective, 'course objective 2');
    await component.dataTable.header.objective.toggle();
    assert.strictEqual(component.dataTable.rows[0].objective, 'course objective 2');
    assert.strictEqual(component.dataTable.rows[1].objective, 'course objective 1');
    assert.strictEqual(component.dataTable.rows[2].objective, 'course objective 0');
  });

  test('sort data-table by competencies', async function (assert) {
    this.set('course', this.course);
    await render(
      hbs`<VisualizerCourseObjectives @course={{this.course}} @isIcon={{false}} @showDataTable={{true}} />`
    );
    assert.strictEqual(component.dataTable.rows[0].competency, 'competency 0');
    assert.strictEqual(component.dataTable.rows[1].competency, 'competency 1');
    assert.strictEqual(component.dataTable.rows[2].competency, 'competency 2');
    await component.dataTable.header.competency.toggle();
    assert.strictEqual(component.dataTable.rows[0].competency, 'competency 0');
    assert.strictEqual(component.dataTable.rows[1].competency, 'competency 1');
    assert.strictEqual(component.dataTable.rows[2].competency, 'competency 2');
    await component.dataTable.header.competency.toggle();
    assert.strictEqual(component.dataTable.rows[0].competency, 'competency 2');
    assert.strictEqual(component.dataTable.rows[1].competency, 'competency 1');
    assert.strictEqual(component.dataTable.rows[2].competency, 'competency 0');
  });

  test('sort data-table by sessions', async function (assert) {
    this.set('course', this.course);
    await render(
      hbs`<VisualizerCourseObjectives @course={{this.course}} @isIcon={{false}} @showDataTable={{true}} />`
    );
    assert.strictEqual(component.dataTable.rows[0].sessions.text, 'Berkeley Investigations');
    assert.strictEqual(component.dataTable.rows[1].sessions.text, 'The San Leandro Horror');
    assert.strictEqual(component.dataTable.rows[2].sessions.text, 'Empty Session');
    await component.dataTable.header.sessions.toggle();
    assert.strictEqual(component.dataTable.rows[0].sessions.text, 'Berkeley Investigations');
    assert.strictEqual(component.dataTable.rows[1].sessions.text, 'Empty Session');
    assert.strictEqual(component.dataTable.rows[2].sessions.text, 'The San Leandro Horror');
    await component.dataTable.header.sessions.toggle();
    assert.strictEqual(component.dataTable.rows[0].sessions.text, 'The San Leandro Horror');
    assert.strictEqual(component.dataTable.rows[1].sessions.text, 'Empty Session');
    assert.strictEqual(component.dataTable.rows[2].sessions.text, 'Berkeley Investigations');
  });

  test('sort data-table by minutes', async function (assert) {
    this.set('course', this.course);
    await render(
      hbs`<VisualizerCourseObjectives @course={{this.course}} @isIcon={{false}} @showDataTable={{true}} />`
    );
    assert.strictEqual(component.dataTable.rows[0].minutes, '630');
    assert.strictEqual(component.dataTable.rows[1].minutes, '180');
    assert.strictEqual(component.dataTable.rows[2].minutes, '0');
    await component.dataTable.header.minutes.toggle();
    assert.strictEqual(component.dataTable.rows[0].minutes, '0');
    assert.strictEqual(component.dataTable.rows[1].minutes, '180');
    assert.strictEqual(component.dataTable.rows[2].minutes, '630');
    await component.dataTable.header.minutes.toggle();
    assert.strictEqual(component.dataTable.rows[0].minutes, '630');
    assert.strictEqual(component.dataTable.rows[1].minutes, '180');
    assert.strictEqual(component.dataTable.rows[2].minutes, '0');
  });

  test('no linked objectives', async function (assert) {
    const course = this.server.create('course');
    const session1 = this.server.create('session', {
      title: 'Berkeley Investigations',
      course,
    });
    const session2 = this.server.create('session', {
      title: 'The San Leandro Horror',
      course,
    });
    const session3 = this.server.create('session', {
      title: 'Empty Session',
      course,
    });
    this.server.create('sessionObjective', {
      session: session1,
    });
    this.server.create('sessionObjective', {
      session: session2,
    });
    this.server.create('sessionObjective', {
      session: session3,
    });
    this.server.create('offering', {
      session: session1,
      startDate: new Date('2019-12-08T12:00:00'),
      endDate: new Date('2019-12-08T17:00:00'),
    });
    this.server.create('offering', {
      session: session1,
      startDate: new Date('2019-12-21T12:00:00'),
      endDate: new Date('2019-12-21T17:30:00'),
    });
    this.server.create('offering', {
      session: session2,
      startDate: new Date('2019-12-05T18:00:00'),
      endDate: new Date('2019-12-05T21:00:00'),
    });

    const courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);

    this.set('course', courseModel);

    await render(hbs`<VisualizerCourseObjectives @course={{this.course}} @isIcon={{false}} />`);
    assert.notOk(component.chart.isPresent);
    assert.ok(component.unlinkedObjectives.isPresent);
    assert.strictEqual(
      component.unlinkedObjectives.text,
      'No Course Objectives Currently Linked to Instructional Time.'
    );
  });
});
