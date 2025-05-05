import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render, waitFor } from '@ember/test-helpers';
import { setupMirage } from 'test-app/tests/test-support/mirage';
import { component } from 'ilios-common/page-objects/components/course/visualize-session-types-graph';
import VisualizeSessionTypesGraph from 'ilios-common/components/course/visualize-session-types-graph';

module('Integration | Component | course/visualize-session-types-graph', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const sessionType1 = this.server.create('session-type', {
      title: 'Standalone',
    });
    const sessionType2 = this.server.create('session-type', {
      title: 'Campaign',
    });
    const sessionType3 = this.server.create('session-type', {
      title: 'Prelude',
    });
    const linkedCourseWithTime = this.server.create('course');
    const linkedCourseWithoutTime = this.server.create('course');
    const session1 = this.server.create('session', {
      title: 'Berkeley Investigations',
      course: linkedCourseWithTime,
      sessionType: sessionType1,
    });
    const session2 = this.server.create('session', {
      title: 'The San Leandro Horror',
      course: linkedCourseWithTime,
      sessionType: sessionType2,
    });
    this.server.create('session', {
      title: 'Two Slices of Pizza',
      course: linkedCourseWithTime,
      sessionType: sessionType3,
    });
    this.server.create('session', {
      title: 'Aardvark',
      course: linkedCourseWithTime,
      sessionType: sessionType3,
    });
    this.server.create('session', {
      title: 'Peanut Butter Stout',
      course: linkedCourseWithoutTime,
      sessionType: sessionType3,
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
    this.emptyCourse = await this.owner
      .lookup('service:store')
      .findRecord('course', this.server.create('course').id);
    this.linkedCourseWithoutTime = await this.owner
      .lookup('service:store')
      .findRecord('course', linkedCourseWithoutTime.id);
    this.linkedCourseWithTime = await this.owner
      .lookup('service:store')
      .findRecord('course', linkedCourseWithTime.id);
  });

  test('it renders', async function (assert) {
    this.set('course', this.linkedCourseWithTime);
    await render(
      <template>
        <VisualizeSessionTypesGraph
          @course={{this.course}}
          @isIcon={{false}}
          @showDataTable={{true}}
        />
      </template>,
    );
    assert.notOk(component.noData.isVisible);
    //let the chart animations finish
    await waitFor('.loaded');
    await waitFor('svg .bars');
    assert.strictEqual(component.chart.bars.length, 2);
    assert.strictEqual(component.chart.bars[0].description, 'Campaign - 180 Minutes');
    assert.strictEqual(component.chart.bars[1].description, 'Standalone - 630 Minutes');
    assert.strictEqual(component.chart.labels.length, 2);
    assert.strictEqual(component.chart.labels[0].text, 'Campaign');
    assert.strictEqual(component.chart.labels[1].text, 'Standalone');
    assert.ok(component.dataTable.actions.download.isVisible);
    assert.strictEqual(component.dataTable.rows.length, 3);
    assert.strictEqual(component.dataTable.rows[0].sessionType.text, 'Prelude');
    assert.strictEqual(
      component.dataTable.rows[0].sessionType.url,
      '/data/courses/1/session-types/3',
    );
    assert.strictEqual(component.dataTable.rows[0].sessions.links.length, 2);
    assert.strictEqual(component.dataTable.rows[0].sessions.links[0].text, 'Aardvark');
    assert.strictEqual(component.dataTable.rows[0].sessions.links[0].url, '/courses/1/sessions/4');
    assert.strictEqual(component.dataTable.rows[0].sessions.links[1].text, 'Two Slices of Pizza');
    assert.strictEqual(component.dataTable.rows[0].sessions.links[1].url, '/courses/1/sessions/3');
    assert.strictEqual(component.dataTable.rows[0].minutes, '0');
    assert.strictEqual(component.dataTable.rows[1].sessionType.text, 'Campaign');
    assert.strictEqual(
      component.dataTable.rows[1].sessionType.url,
      '/data/courses/1/session-types/2',
    );
    assert.strictEqual(component.dataTable.rows[1].sessions.links.length, 1);
    assert.strictEqual(
      component.dataTable.rows[1].sessions.links[0].text,
      'The San Leandro Horror',
    );
    assert.strictEqual(component.dataTable.rows[1].sessions.links[0].url, '/courses/1/sessions/2');
    assert.strictEqual(component.dataTable.rows[1].minutes, '180');
    assert.strictEqual(component.dataTable.rows[2].sessionType.text, 'Standalone');
    assert.strictEqual(
      component.dataTable.rows[2].sessionType.url,
      '/data/courses/1/session-types/1',
    );
    assert.strictEqual(component.dataTable.rows[2].sessions.links.length, 1);
    assert.strictEqual(
      component.dataTable.rows[2].sessions.links[0].text,
      'Berkeley Investigations',
    );
    assert.strictEqual(component.dataTable.rows[2].sessions.links[0].url, '/courses/1/sessions/1');
    assert.strictEqual(component.dataTable.rows[2].minutes, '630');
  });

  test('filter applies', async function (assert) {
    this.set('title', 'Campaign');
    this.set('course', this.linkedCourseWithTime);
    await render(
      <template>
        <VisualizeSessionTypesGraph
          @course={{this.course}}
          @filter={{this.title}}
          @isIcon={{false}}
          @showDataTable={{true}}
        />
      </template>,
    );
    assert.notOk(component.noData.isVisible);
    //let the chart animations finish
    await waitFor('.loaded');
    await waitFor('svg .bars');
    assert.strictEqual(component.chart.bars.length, 1);
    assert.strictEqual(component.chart.labels.length, 1);
    assert.strictEqual(component.chart.labels[0].text, 'Campaign');
    assert.strictEqual(component.dataTable.rows.length, 1);
    assert.strictEqual(component.dataTable.rows[0].sessionType.text, 'Campaign');
  });

  test('filter out all data', async function (assert) {
    this.set('title', 'Geflarknik');
    this.set('course', this.linkedCourseWithTime);
    await render(
      <template>
        <VisualizeSessionTypesGraph
          @course={{this.course}}
          @filter={{this.title}}
          @isIcon={{false}}
          @showDataTable={{true}}
        />
      </template>,
    );
    assert.notOk(component.chart.isVisible);
    assert.notOk(component.noData.isVisible);
    assert.ok(component.dataTable.isVisible);
    assert.strictEqual(component.dataTable.rows.length, 0);
  });

  test('sort data-table by session type', async function (assert) {
    this.set('course', this.linkedCourseWithTime);
    await render(
      <template>
        <VisualizeSessionTypesGraph
          @course={{this.course}}
          @isIcon={{false}}
          @showDataTable={{true}}
        />
      </template>,
    );
    assert.strictEqual(component.dataTable.rows[0].sessionType.text, 'Prelude');
    assert.strictEqual(component.dataTable.rows[1].sessionType.text, 'Campaign');
    assert.strictEqual(component.dataTable.rows[2].sessionType.text, 'Standalone');
    await component.dataTable.header.sessionType.toggle();
    assert.strictEqual(component.dataTable.rows[0].sessionType.text, 'Campaign');
    assert.strictEqual(component.dataTable.rows[1].sessionType.text, 'Prelude');
    assert.strictEqual(component.dataTable.rows[2].sessionType.text, 'Standalone');
    await component.dataTable.header.sessionType.toggle();
    assert.strictEqual(component.dataTable.rows[0].sessionType.text, 'Standalone');
    assert.strictEqual(component.dataTable.rows[1].sessionType.text, 'Prelude');
    assert.strictEqual(component.dataTable.rows[2].sessionType.text, 'Campaign');
  });

  test('sort data-table by sessions', async function (assert) {
    this.set('course', this.linkedCourseWithTime);
    await render(
      <template>
        <VisualizeSessionTypesGraph
          @course={{this.course}}
          @isIcon={{false}}
          @showDataTable={{true}}
        />
      </template>,
    );
    assert.strictEqual(component.dataTable.rows[0].sessions.text, 'Aardvark, Two Slices of Pizza');
    assert.strictEqual(component.dataTable.rows[1].sessions.text, 'The San Leandro Horror');
    assert.strictEqual(component.dataTable.rows[2].sessions.text, 'Berkeley Investigations');
    await component.dataTable.header.sessions.toggle();
    assert.strictEqual(component.dataTable.rows[0].sessions.text, 'Aardvark, Two Slices of Pizza');
    assert.strictEqual(component.dataTable.rows[1].sessions.text, 'Berkeley Investigations');
    assert.strictEqual(component.dataTable.rows[2].sessions.text, 'The San Leandro Horror');
    await component.dataTable.header.sessions.toggle();
    assert.strictEqual(component.dataTable.rows[0].sessions.text, 'The San Leandro Horror');
    assert.strictEqual(component.dataTable.rows[1].sessions.text, 'Berkeley Investigations');
    assert.strictEqual(component.dataTable.rows[2].sessions.text, 'Aardvark, Two Slices of Pizza');
  });

  test('sort data-table by minutes', async function (assert) {
    this.set('course', this.linkedCourseWithTime);
    await render(
      <template>
        <VisualizeSessionTypesGraph
          @course={{this.course}}
          @isIcon={{false}}
          @showDataTable={{true}}
        />
      </template>,
    );
    assert.strictEqual(component.dataTable.rows[0].minutes, '0');
    assert.strictEqual(component.dataTable.rows[1].minutes, '180');
    assert.strictEqual(component.dataTable.rows[2].minutes, '630');
    await component.dataTable.header.minutes.toggle();
    assert.strictEqual(component.dataTable.rows[0].minutes, '630');
    assert.strictEqual(component.dataTable.rows[1].minutes, '180');
    assert.strictEqual(component.dataTable.rows[2].minutes, '0');
    await component.dataTable.header.minutes.toggle();
    assert.strictEqual(component.dataTable.rows[0].minutes, '0');
    assert.strictEqual(component.dataTable.rows[1].minutes, '180');
    assert.strictEqual(component.dataTable.rows[2].minutes, '630');
  });

  test('no data', async function (assert) {
    this.set('course', this.emptyCourse);
    await render(
      <template>
        <VisualizeSessionTypesGraph
          @course={{this.course}}
          @isIcon={{false}}
          @showDataTable={{true}}
        />
      </template>,
    );
    assert.notOk(component.chart.isVisible);
    assert.notOk(component.dataTable.isVisible);
    assert.strictEqual(component.noData.text, 'This course has no sessions.');
  });

  test('only zero time data', async function (assert) {
    this.set('course', this.linkedCourseWithoutTime);
    await render(
      <template>
        <VisualizeSessionTypesGraph
          @course={{this.course}}
          @isIcon={{false}}
          @showDataTable={{true}}
        />
      </template>,
    );
    assert.notOk(component.chart.isVisible);
    assert.notOk(component.noData.isVisible);
    assert.strictEqual(component.dataTable.rows.length, 1);
    assert.strictEqual(component.dataTable.rows[0].sessionType.text, 'Prelude');
    assert.strictEqual(component.dataTable.rows[0].sessions.links.length, 1);
    assert.strictEqual(component.dataTable.rows[0].sessions.links[0].text, 'Peanut Butter Stout');
    assert.strictEqual(component.dataTable.rows[0].sessions.links[0].url, '/courses/2/sessions/5');
    assert.strictEqual(component.dataTable.rows[0].minutes, '0');
  });
});
