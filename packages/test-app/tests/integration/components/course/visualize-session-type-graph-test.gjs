import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render, waitFor } from '@ember/test-helpers';
import { setupMirage } from 'test-app/tests/test-support/mirage';
import { component } from 'ilios-common/page-objects/components/course/visualize-session-type-graph';
import VisualizeSessionTypeGraph from 'ilios-common/components/course/visualize-session-type-graph';

module('Integration | Component | course/visualize-session-type-graph', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const vocabulary1 = this.server.create('vocabulary');
    const vocabulary2 = this.server.create('vocabulary');
    const term1 = this.server.create('term', {
      vocabulary: vocabulary1,
      title: 'Standalone',
    });
    const term2 = this.server.create('term', {
      vocabulary: vocabulary2,
      title: 'Campaign',
    });
    const term3 = this.server.create('term', {
      vocabulary: vocabulary2,
      title: 'Prelude',
    });
    const sessionType = this.server.create('session-type');
    const linkedCourseWithTime = this.server.create('course');
    const linkedCourseWithoutTime = this.server.create('course');
    const session1 = this.server.create('session', {
      title: 'Berkeley Investigations',
      course: linkedCourseWithTime,
      terms: [term1],
      sessionType,
    });
    const session2 = this.server.create('session', {
      title: 'The San Leandro Horror',
      course: linkedCourseWithTime,
      terms: [term2],
      sessionType,
    });
    this.server.create('session', {
      title: 'Two Slices of Pizza',
      course: linkedCourseWithTime,
      terms: [term3],
      sessionType,
    });
    this.server.create('session', {
      title: 'Aardvark',
      course: linkedCourseWithTime,
      terms: [term3],
      sessionType,
    });
    this.server.create('session', {
      title: 'Peanut Butter Stout',
      course: linkedCourseWithoutTime,
      terms: [term2],
      sessionType,
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
    this.sessionType = await this.owner
      .lookup('service:store')
      .findRecord('session-type', sessionType.id);
  });

  test('it renders', async function (assert) {
    this.set('course', this.linkedCourseWithTime);
    this.set('type', this.sessionType);
    await render(
      <template>
        <VisualizeSessionTypeGraph
          @course={{this.course}}
          @sessionType={{this.type}}
          @isIcon={{false}}
          @showDataTable={{true}}
        />
      </template>,
    );
    //let the chart animations finish
    assert.notOk(component.noData.isVisible);
    await waitFor('.loaded');
    await waitFor('svg .bars');
    assert.strictEqual(component.chart.bars.length, 2);
    assert.strictEqual(
      component.chart.bars[0].description,
      'Vocabulary 1 - Standalone - 630 Minutes',
    );
    assert.strictEqual(
      component.chart.bars[1].description,
      'Vocabulary 2 - Campaign - 180 Minutes',
    );
    assert.strictEqual(component.chart.labels.length, 2);
    assert.strictEqual(component.chart.labels[0].text, 'Vocabulary 1 - Standalone');
    assert.strictEqual(component.chart.labels[1].text, 'Vocabulary 2 - Campaign');
    assert.ok(component.dataTable.actions.download.isVisible);
    assert.strictEqual(component.dataTable.rows.length, 3);
    assert.strictEqual(component.dataTable.rows[0].vocabularyTerm, 'Vocabulary 1 - Standalone');
    assert.strictEqual(component.dataTable.rows[0].sessions.links.length, 1);
    assert.strictEqual(
      component.dataTable.rows[0].sessions.links[0].text,
      'Berkeley Investigations',
    );
    assert.strictEqual(component.dataTable.rows[0].sessions.links[0].url, '/courses/1/sessions/1');
    assert.strictEqual(component.dataTable.rows[0].minutes, '630');
    assert.strictEqual(component.dataTable.rows[1].vocabularyTerm, 'Vocabulary 2 - Campaign');
    assert.strictEqual(component.dataTable.rows[1].sessions.links.length, 1);
    assert.strictEqual(
      component.dataTable.rows[1].sessions.links[0].text,
      'The San Leandro Horror',
    );
    assert.strictEqual(component.dataTable.rows[1].sessions.links[0].url, '/courses/1/sessions/2');
    assert.strictEqual(component.dataTable.rows[1].minutes, '180');
    assert.strictEqual(component.dataTable.rows[2].sessions.links.length, 2);
    assert.strictEqual(component.dataTable.rows[2].sessions.links[0].text, 'Aardvark');
    assert.strictEqual(component.dataTable.rows[2].sessions.links[1].text, 'Two Slices of Pizza');
    assert.strictEqual(component.dataTable.rows[2].sessions.links[0].url, '/courses/1/sessions/4');
    assert.strictEqual(component.dataTable.rows[2].sessions.links[1].url, '/courses/1/sessions/3');
    assert.strictEqual(component.dataTable.rows[2].minutes, '0');
  });

  test('sort data-table by vocabulary term', async function (assert) {
    this.set('course', this.linkedCourseWithTime);
    this.set('type', this.sessionType);
    await render(
      <template>
        <VisualizeSessionTypeGraph
          @course={{this.course}}
          @sessionType={{this.type}}
          @isIcon={{false}}
          @showDataTable={{true}}
        />
      </template>,
    );
    assert.strictEqual(component.dataTable.rows[0].vocabularyTerm, 'Vocabulary 1 - Standalone');
    assert.strictEqual(component.dataTable.rows[1].vocabularyTerm, 'Vocabulary 2 - Campaign');
    assert.strictEqual(component.dataTable.rows[2].vocabularyTerm, 'Vocabulary 2 - Prelude');
    await component.dataTable.header.vocabularyTerm.toggle();
    assert.strictEqual(component.dataTable.rows[0].vocabularyTerm, 'Vocabulary 2 - Prelude');
    assert.strictEqual(component.dataTable.rows[1].vocabularyTerm, 'Vocabulary 2 - Campaign');
    assert.strictEqual(component.dataTable.rows[2].vocabularyTerm, 'Vocabulary 1 - Standalone');
    await component.dataTable.header.vocabularyTerm.toggle();
    assert.strictEqual(component.dataTable.rows[0].vocabularyTerm, 'Vocabulary 1 - Standalone');
    assert.strictEqual(component.dataTable.rows[1].vocabularyTerm, 'Vocabulary 2 - Campaign');
    assert.strictEqual(component.dataTable.rows[2].vocabularyTerm, 'Vocabulary 2 - Prelude');
  });

  test('sort data-table by sessions', async function (assert) {
    this.set('course', this.linkedCourseWithTime);
    this.set('type', this.sessionType);
    await render(
      <template>
        <VisualizeSessionTypeGraph
          @course={{this.course}}
          @sessionType={{this.type}}
          @isIcon={{false}}
          @showDataTable={{true}}
        />
      </template>,
    );
    assert.strictEqual(component.dataTable.rows[0].sessions.text, 'Berkeley Investigations');
    assert.strictEqual(component.dataTable.rows[1].sessions.text, 'The San Leandro Horror');
    assert.strictEqual(component.dataTable.rows[2].sessions.text, 'Aardvark, Two Slices of Pizza');
    await component.dataTable.header.sessions.toggle();
    assert.strictEqual(component.dataTable.rows[0].sessions.text, 'Aardvark, Two Slices of Pizza');
    assert.strictEqual(component.dataTable.rows[1].sessions.text, 'Berkeley Investigations');
    assert.strictEqual(component.dataTable.rows[2].sessions.text, 'The San Leandro Horror');
    await component.dataTable.header.sessions.toggle();
    assert.strictEqual(component.dataTable.rows[0].sessions.text, 'The San Leandro Horror');
    assert.strictEqual(component.dataTable.rows[1].sessions.text, 'Berkeley Investigations');
    assert.strictEqual(component.dataTable.rows[2].sessions.text, 'Aardvark, Two Slices of Pizza');
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
    this.set('type', this.sessionType);
    await render(
      <template>
        <VisualizeSessionTypeGraph
          @course={{this.course}}
          @sessionType={{this.type}}
          @isIcon={{false}}
          @showDataTable={{true}}
        />
      </template>,
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

  test('no data', async function (assert) {
    this.set('course', this.emptyCourse);
    this.set('type', this.sessionType);
    await render(
      <template>
        <VisualizeSessionTypeGraph
          @course={{this.course}}
          @sessionType={{this.type}}
          @isIcon={{false}}
          @showDataTable={{true}}
        />
      </template>,
    );
    assert.notOk(component.chart.isVisible);
    assert.notOk(component.dataTable.isVisible);
    assert.strictEqual(
      component.noData.text,
      'No vocabulary terms have been linked to any session type 0 sessions in this course.',
    );
  });

  test('only zero time data', async function (assert) {
    this.set('course', this.linkedCourseWithoutTime);
    this.set('type', this.sessionType);
    await render(
      <template>
        <VisualizeSessionTypeGraph
          @course={{this.course}}
          @sessionType={{this.type}}
          @isIcon={{false}}
          @showDataTable={{true}}
        />
      </template>,
    );
    assert.notOk(component.chart.isVisible);
    assert.notOk(component.noData.isVisible);
    assert.strictEqual(component.dataTable.rows.length, 1);
    assert.strictEqual(component.dataTable.rows[0].vocabularyTerm, 'Vocabulary 2 - Campaign');
    assert.strictEqual(component.dataTable.rows[0].sessions.links.length, 1);
    assert.strictEqual(component.dataTable.rows[0].sessions.links[0].text, 'Peanut Butter Stout');
    assert.strictEqual(component.dataTable.rows[0].sessions.links[0].url, '/courses/2/sessions/5');
    assert.strictEqual(component.dataTable.rows[0].minutes, '0');
  });
});
