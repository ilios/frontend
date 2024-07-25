import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render, waitFor } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'test-app/tests/test-support/mirage';
import { component } from 'ilios-common/page-objects/components/course/visualize-instructors-graph';

module('Integration | Component | course/visualize-instructors-graph', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const instructor1 = this.server.create('user', { displayName: 'Marie' });
    const instructor2 = this.server.create('user', { displayName: 'Daisy' });
    const instructor3 = this.server.create('user', { displayName: 'Duke' });
    const instructor4 = this.server.create('user', {
      displayName: 'William',
    });

    const course = this.server.create('course');
    const session1 = this.server.create('session', {
      title: 'Berkeley Investigations',
      course,
    });
    const session2 = this.server.create('session', {
      title: 'The San Leandro Horror',
      course,
    });
    this.server.create('offering', {
      session: session1,
      startDate: new Date('2019-12-08T12:00:00'),
      endDate: new Date('2019-12-08T17:00:00'),
      instructors: [instructor1],
    });
    this.server.create('offering', {
      session: session1,
      startDate: new Date('2019-12-21T12:00:00'),
      endDate: new Date('2019-12-21T17:30:00'),
      instructors: [instructor1, instructor4],
    });
    this.server.create('offering', {
      session: session2,
      startDate: new Date('2019-12-05T18:00:00'),
      endDate: new Date('2019-12-05T21:00:00'),
      instructors: [instructor1, instructor2, instructor3, instructor4],
    });

    this.course = await this.owner.lookup('service:store').findRecord('course', course.id);
  });

  test('it renders', async function (assert) {
    this.set('course', this.course);
    await render(hbs`<Course::VisualizeInstructorsGraph @course={{this.course}} @isIcon={{false}} @showDataTable={{true}}/>
`);
    //let the chart animations finish
    await waitFor('.loaded');
    await waitFor('svg .bars');
    assert.strictEqual(component.chart.bars.length, 4);
    assert.strictEqual(component.chart.bars[0].description, 'Daisy - 180 Minutes');
    assert.strictEqual(component.chart.bars[1].description, 'Duke - 180 Minutes');
    assert.strictEqual(component.chart.bars[2].description, 'William - 510 Minutes');
    assert.strictEqual(component.chart.bars[3].description, 'Marie - 810 Minutes');
    assert.strictEqual(component.chart.labels.length, 4);
    assert.strictEqual(component.chart.labels[0].text, 'Daisy');
    assert.strictEqual(component.chart.labels[1].text, 'Duke');
    assert.strictEqual(component.chart.labels[2].text, 'William');
    assert.strictEqual(component.chart.labels[3].text, 'Marie');
    assert.strictEqual(component.dataTable.rows.length, 4);
    assert.strictEqual(component.dataTable.rows[0].instructor, 'Daisy');
    assert.strictEqual(component.dataTable.rows[0].sessions.links.length, 1);
    assert.strictEqual(
      component.dataTable.rows[0].sessions.links[0].text,
      'The San Leandro Horror',
    );
    assert.strictEqual(component.dataTable.rows[0].sessions.links[0].url, '/courses/1/sessions/2');
    assert.strictEqual(component.dataTable.rows[0].minutes, '180');
    assert.strictEqual(component.dataTable.rows[1].instructor, 'Duke');
    assert.strictEqual(component.dataTable.rows[1].sessions.links.length, 1);
    assert.strictEqual(
      component.dataTable.rows[1].sessions.links[0].text,
      'The San Leandro Horror',
    );
    assert.strictEqual(component.dataTable.rows[1].sessions.links[0].url, '/courses/1/sessions/2');
    assert.strictEqual(component.dataTable.rows[1].minutes, '180');
    assert.strictEqual(component.dataTable.rows[2].instructor, 'William');
    assert.strictEqual(component.dataTable.rows[2].sessions.links.length, 2);
    assert.strictEqual(
      component.dataTable.rows[2].sessions.links[0].text,
      'Berkeley Investigations',
    );
    assert.strictEqual(component.dataTable.rows[2].sessions.links[0].url, '/courses/1/sessions/1');

    assert.strictEqual(
      component.dataTable.rows[2].sessions.links[1].text,
      'The San Leandro Horror',
    );
    assert.strictEqual(component.dataTable.rows[2].sessions.links[1].url, '/courses/1/sessions/2');
    assert.strictEqual(component.dataTable.rows[2].minutes, '510');
    assert.strictEqual(component.dataTable.rows[3].instructor, 'Marie');
    assert.strictEqual(component.dataTable.rows[3].sessions.links.length, 2);
    assert.strictEqual(
      component.dataTable.rows[3].sessions.links[0].text,
      'Berkeley Investigations',
    );
    assert.strictEqual(component.dataTable.rows[3].sessions.links[0].url, '/courses/1/sessions/1');

    assert.strictEqual(
      component.dataTable.rows[3].sessions.links[1].text,
      'The San Leandro Horror',
    );
    assert.strictEqual(component.dataTable.rows[3].sessions.links[1].url, '/courses/1/sessions/2');
    assert.strictEqual(component.dataTable.rows[3].minutes, '810');
  });

  test('filter applies', async function (assert) {
    this.set('name', 'Marie');
    this.set('course', this.course);
    await render(
      hbs`<Course::VisualizeInstructorsGraph @course={{this.course}} @filter={{this.name}} @isIcon={{false}} @showDataTable={{true}}/>
`,
    );
    //let the chart animations finish
    await waitFor('.loaded');
    await waitFor('svg .bars');
    assert.strictEqual(component.chart.bars.length, 1);
    assert.strictEqual(component.chart.labels.length, 1);
    assert.strictEqual(component.chart.labels[0].text, 'Marie');
    assert.strictEqual(component.dataTable.rows.length, 1);
    assert.strictEqual(component.dataTable.rows[0].instructor, 'Marie');
  });

  test('sort data-table by instructor', async function (assert) {
    this.set('course', this.course);
    await render(hbs`<Course::VisualizeInstructorsGraph @course={{this.course}} @isIcon={{false}} @showDataTable={{true}}/>
`);
    assert.strictEqual(component.dataTable.rows[0].instructor, 'Daisy');
    assert.strictEqual(component.dataTable.rows[1].instructor, 'Duke');
    assert.strictEqual(component.dataTable.rows[2].instructor, 'William');
    assert.strictEqual(component.dataTable.rows[3].instructor, 'Marie');
    await component.dataTable.header.instructor.toggle();
    assert.strictEqual(component.dataTable.rows[0].instructor, 'Daisy');
    assert.strictEqual(component.dataTable.rows[1].instructor, 'Duke');
    assert.strictEqual(component.dataTable.rows[2].instructor, 'Marie');
    assert.strictEqual(component.dataTable.rows[3].instructor, 'William');
    await component.dataTable.header.instructor.toggle();
    assert.strictEqual(component.dataTable.rows[0].instructor, 'William');
    assert.strictEqual(component.dataTable.rows[1].instructor, 'Marie');
    assert.strictEqual(component.dataTable.rows[2].instructor, 'Duke');
    assert.strictEqual(component.dataTable.rows[3].instructor, 'Daisy');
  });

  test('sort data-table by sessions', async function (assert) {
    this.set('course', this.course);
    await render(hbs`<Course::VisualizeInstructorsGraph @course={{this.course}} @isIcon={{false}} @showDataTable={{true}}/>
`);
    assert.strictEqual(component.dataTable.rows[0].sessions.text, 'The San Leandro Horror');
    assert.strictEqual(component.dataTable.rows[1].sessions.text, 'The San Leandro Horror');
    assert.strictEqual(
      component.dataTable.rows[2].sessions.text,
      'Berkeley Investigations, The San Leandro Horror',
    );
    assert.strictEqual(
      component.dataTable.rows[3].sessions.text,
      'Berkeley Investigations, The San Leandro Horror',
    );
    await component.dataTable.header.sessions.toggle();
    assert.strictEqual(
      component.dataTable.rows[0].sessions.text,
      'Berkeley Investigations, The San Leandro Horror',
    );
    assert.strictEqual(
      component.dataTable.rows[1].sessions.text,
      'Berkeley Investigations, The San Leandro Horror',
    );
    assert.strictEqual(component.dataTable.rows[2].sessions.text, 'The San Leandro Horror');
    assert.strictEqual(component.dataTable.rows[3].sessions.text, 'The San Leandro Horror');
    await component.dataTable.header.sessions.toggle();
    assert.strictEqual(component.dataTable.rows[0].sessions.text, 'The San Leandro Horror');
    assert.strictEqual(component.dataTable.rows[1].sessions.text, 'The San Leandro Horror');
    assert.strictEqual(
      component.dataTable.rows[2].sessions.text,
      'Berkeley Investigations, The San Leandro Horror',
    );
    assert.strictEqual(
      component.dataTable.rows[3].sessions.text,
      'Berkeley Investigations, The San Leandro Horror',
    );
  });

  test('sort data-table by minutes', async function (assert) {
    this.set('course', this.course);
    await render(hbs`<Course::VisualizeInstructorsGraph @course={{this.course}} @isIcon={{false}} @showDataTable={{true}}/>
`);
    assert.strictEqual(component.dataTable.rows[0].minutes, '180');
    assert.strictEqual(component.dataTable.rows[1].minutes, '180');
    assert.strictEqual(component.dataTable.rows[2].minutes, '510');
    assert.strictEqual(component.dataTable.rows[3].minutes, '810');
    await component.dataTable.header.minutes.toggle();
    assert.strictEqual(component.dataTable.rows[0].minutes, '810');
    assert.strictEqual(component.dataTable.rows[1].minutes, '510');
    assert.strictEqual(component.dataTable.rows[2].minutes, '180');
    assert.strictEqual(component.dataTable.rows[3].minutes, '180');
    await component.dataTable.header.minutes.toggle();
    assert.strictEqual(component.dataTable.rows[0].minutes, '180');
    assert.strictEqual(component.dataTable.rows[1].minutes, '180');
    assert.strictEqual(component.dataTable.rows[2].minutes, '510');
    assert.strictEqual(component.dataTable.rows[3].minutes, '810');
  });
});
