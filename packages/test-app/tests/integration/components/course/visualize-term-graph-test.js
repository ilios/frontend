import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render, waitFor } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'test-app/tests/test-support/mirage';
import { component } from 'ilios-common/page-objects/components/course/visualize-term-graph';

module('Integration | Component | course/visualize-term-graph', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const vocabulary = this.server.create('vocabulary');
    const term = this.server.create('term', { vocabulary });
    const course = this.server.create('course');
    const sessionType1 = this.server.create('session-type', {
      title: 'Standalone',
    });
    const sessionType2 = this.server.create('session-type', {
      title: 'Campaign',
    });
    const session1 = this.server.create('session', {
      title: 'Berkeley Investigations',
      course,
      terms: [term],
      sessionType: sessionType1,
    });
    const session2 = this.server.create('session', {
      title: 'The San Leandro Horror',
      course,
      terms: [term],
      sessionType: sessionType2,
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
    this.term = await this.owner.lookup('service:store').findRecord('term', term.id);
  });

  test('it renders', async function (assert) {
    this.set('course', this.course);
    this.set('term', this.term);

    await render(
      hbs`<Course::VisualizeTermGraph @course={{this.course}} @term={{this.term}} @isIcon={{false}} @showDataTable={{true}} />
`,
    );
    //let the chart animations finish
    await waitFor('.loaded');
    await waitFor('svg .bars');
    assert.strictEqual(component.chart.bars.length, 2);
    assert.strictEqual(component.chart.bars[0].description, 'Campaign - 180 Minutes');
    assert.strictEqual(component.chart.bars[1].description, 'Standalone - 630 Minutes');
    assert.strictEqual(component.chart.labels.length, 2);
    assert.strictEqual(component.chart.labels[0].text, 'Campaign');
    assert.strictEqual(component.chart.labels[1].text, 'Standalone');
    assert.strictEqual(component.dataTable.rows.length, 2);
    assert.strictEqual(component.dataTable.rows[0].sessionType, 'Campaign');
    assert.strictEqual(component.dataTable.rows[0].sessions.links.length, 1);
    assert.strictEqual(
      component.dataTable.rows[0].sessions.links[0].text,
      'The San Leandro Horror',
    );
    assert.strictEqual(component.dataTable.rows[0].sessions.links[0].url, '/courses/1/sessions/2');
    assert.strictEqual(component.dataTable.rows[0].minutes, '180');
    assert.strictEqual(component.dataTable.rows[1].sessionType, 'Standalone');
    assert.strictEqual(component.dataTable.rows[1].sessions.links.length, 1);
    assert.strictEqual(
      component.dataTable.rows[1].sessions.links[0].text,
      'Berkeley Investigations',
    );
    assert.strictEqual(component.dataTable.rows[1].sessions.links[0].url, '/courses/1/sessions/1');
    assert.strictEqual(component.dataTable.rows[1].minutes, '630');
  });

  test('sort data-table by session type', async function (assert) {
    this.set('course', this.course);
    await render(
      hbs`<Course::VisualizeTermGraph @course={{this.course}} @term={{this.term}} @isIcon={{false}} @showDataTable={{true}} />
`,
    );
    assert.strictEqual(component.dataTable.rows[0].sessionType, 'Campaign');
    assert.strictEqual(component.dataTable.rows[1].sessionType, 'Standalone');
    await component.dataTable.header.sessionType.toggle();
    assert.strictEqual(component.dataTable.rows[0].sessionType, 'Campaign');
    assert.strictEqual(component.dataTable.rows[1].sessionType, 'Standalone');
    await component.dataTable.header.sessionType.toggle();
    assert.strictEqual(component.dataTable.rows[0].sessionType, 'Standalone');
    assert.strictEqual(component.dataTable.rows[1].sessionType, 'Campaign');
    await component.dataTable.header.sessionType.toggle();
    assert.strictEqual(component.dataTable.rows[0].sessionType, 'Campaign');
    assert.strictEqual(component.dataTable.rows[1].sessionType, 'Standalone');
  });

  test('sort data-table by sessions', async function (assert) {
    this.set('course', this.course);
    await render(
      hbs`<Course::VisualizeTermGraph @course={{this.course}} @term={{this.term}} @isIcon={{false}} @showDataTable={{true}} />
`,
    );
    assert.strictEqual(component.dataTable.rows[0].sessions.text, 'The San Leandro Horror');
    assert.strictEqual(component.dataTable.rows[1].sessions.text, 'Berkeley Investigations');
    await component.dataTable.header.sessions.toggle();
    assert.strictEqual(component.dataTable.rows[0].sessions.text, 'Berkeley Investigations');
    assert.strictEqual(component.dataTable.rows[1].sessions.text, 'The San Leandro Horror');
    await component.dataTable.header.sessions.toggle();
    assert.strictEqual(component.dataTable.rows[0].sessions.text, 'The San Leandro Horror');
    assert.strictEqual(component.dataTable.rows[1].sessions.text, 'Berkeley Investigations');
    await component.dataTable.header.sessions.toggle();
    assert.strictEqual(component.dataTable.rows[0].sessions.text, 'Berkeley Investigations');
    assert.strictEqual(component.dataTable.rows[1].sessions.text, 'The San Leandro Horror');
  });

  test('sort data-table by minutes', async function (assert) {
    this.set('course', this.course);
    await render(
      hbs`<Course::VisualizeTermGraph @course={{this.course}} @term={{this.term}} @isIcon={{false}} @showDataTable={{true}} />
`,
    );
    assert.strictEqual(component.dataTable.rows[0].minutes, '180');
    assert.strictEqual(component.dataTable.rows[1].minutes, '630');
    await component.dataTable.header.minutes.toggle();
    assert.strictEqual(component.dataTable.rows[0].minutes, '630');
    assert.strictEqual(component.dataTable.rows[1].minutes, '180');
    await component.dataTable.header.minutes.toggle();
    assert.strictEqual(component.dataTable.rows[0].minutes, '180');
    assert.strictEqual(component.dataTable.rows[1].minutes, '630');
  });
});
