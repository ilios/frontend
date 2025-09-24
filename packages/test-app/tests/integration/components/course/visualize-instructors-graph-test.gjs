import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render, waitFor } from '@ember/test-helpers';
import { setupMirage } from 'test-app/tests/test-support/mirage';
import { component } from 'ilios-common/page-objects/components/course/visualize-instructors-graph';
import VisualizeInstructorsGraph from 'ilios-common/components/course/visualize-instructors-graph';

module('Integration | Component | course/visualize-instructors-graph', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const instructor1 = this.server.create('user', { displayName: 'Marie' });
    const instructor2 = this.server.create('user', { displayName: 'Daisy' });
    const instructor3 = this.server.create('user', { displayName: 'Duke' });
    const instructor4 = this.server.create('user', { displayName: 'William' });
    const instructor5 = this.server.create('user', { displayName: 'Roland' });
    const linkedCourseWithTime = this.server.create('course');
    const linkedCourseWithoutTime = this.server.create('course');

    const session1 = this.server.create('session', {
      title: 'Berkeley Investigations',
      course: linkedCourseWithTime,
    });
    const session2 = this.server.create('session', {
      title: 'The San Leandro Horror',
      course: linkedCourseWithTime,
    });
    const session3 = this.server.create('session', {
      title: 'Two Slices of Pizza',
      course: linkedCourseWithoutTime,
    });
    const session4 = this.server.create('session', {
      title: 'Aardvark',
      course: linkedCourseWithTime,
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
    this.server.create('offering', {
      session: session3,
      startDate: new Date('2019-12-08T12:00:00'),
      endDate: new Date('2019-12-08T12:00:00'),
      instructors: [instructor5],
    });
    this.server.create('offering', {
      session: session4,
      startDate: new Date('2019-12-08T12:00:00'),
      endDate: new Date('2019-12-08T12:00:00'),
      instructors: [instructor4],
    });
    this.emptyCourse = await this.owner
      .lookup('service:store')
      .findRecord('course', this.server.create('course').id);
    this.linkedCourseWithTime = await this.owner
      .lookup('service:store')
      .findRecord('course', linkedCourseWithTime.id);
    this.linkedCourseWithoutTime = await this.owner
      .lookup('service:store')
      .findRecord('course', linkedCourseWithoutTime.id);
  });

  test('it renders', async function (assert) {
    this.set('course', this.linkedCourseWithTime);
    await render(
      <template>
        <VisualizeInstructorsGraph
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
    assert.strictEqual(component.chart.bars.length, 4);
    assert.strictEqual(component.chart.bars[0].description, 'Daisy - 180 Minutes');
    assert.strictEqual(component.chart.bars[1].description, 'Duke - 180 Minutes');
    assert.strictEqual(component.chart.bars[2].description, 'William - 510 Minutes');
    assert.strictEqual(component.chart.bars[3].description, 'Marie - 810 Minutes');
    assert.strictEqual(component.chart.labels.length, 4);
    assert.strictEqual(component.chart.labels[0].text, 'Daisy\u200b');
    assert.strictEqual(component.chart.labels[1].text, 'Duke\u200b');
    assert.strictEqual(component.chart.labels[2].text, 'William\u200b');
    assert.strictEqual(component.chart.labels[3].text, 'Marie\u200b');
    assert.ok(component.dataTable.actions.download.isVisible);
    assert.strictEqual(component.dataTable.rows.length, 4);
    assert.strictEqual(component.dataTable.rows[0].instructor.text, 'Daisy');
    assert.strictEqual(component.dataTable.rows[0].instructor.url, '/data/courses/1/instructors/2');
    assert.strictEqual(component.dataTable.rows[0].sessions.links.length, 1);
    assert.strictEqual(
      component.dataTable.rows[0].sessions.links[0].text,
      'The San Leandro Horror',
    );
    assert.strictEqual(component.dataTable.rows[0].sessions.links[0].url, '/courses/1/sessions/2');
    assert.strictEqual(component.dataTable.rows[0].minutes, '180');
    assert.strictEqual(component.dataTable.rows[1].instructor.text, 'Duke');
    assert.strictEqual(component.dataTable.rows[1].instructor.url, '/data/courses/1/instructors/3');
    assert.strictEqual(component.dataTable.rows[1].sessions.links.length, 1);
    assert.strictEqual(
      component.dataTable.rows[1].sessions.links[0].text,
      'The San Leandro Horror',
    );
    assert.strictEqual(component.dataTable.rows[1].sessions.links[0].url, '/courses/1/sessions/2');
    assert.strictEqual(component.dataTable.rows[1].minutes, '180');
    assert.strictEqual(component.dataTable.rows[2].instructor.text, 'William');
    assert.strictEqual(component.dataTable.rows[2].instructor.url, '/data/courses/1/instructors/4');
    assert.strictEqual(component.dataTable.rows[2].sessions.links.length, 3);
    assert.strictEqual(component.dataTable.rows[2].sessions.links[0].text, 'Aardvark');
    assert.strictEqual(component.dataTable.rows[2].sessions.links[0].url, '/courses/1/sessions/4');
    assert.strictEqual(
      component.dataTable.rows[2].sessions.links[1].text,
      'Berkeley Investigations',
    );
    assert.strictEqual(component.dataTable.rows[2].sessions.links[1].url, '/courses/1/sessions/1');
    assert.strictEqual(
      component.dataTable.rows[2].sessions.links[2].text,
      'The San Leandro Horror',
    );
    assert.strictEqual(component.dataTable.rows[2].sessions.links[2].url, '/courses/1/sessions/2');
    assert.strictEqual(component.dataTable.rows[2].minutes, '510');
    assert.strictEqual(component.dataTable.rows[3].instructor.text, 'Marie');
    assert.strictEqual(component.dataTable.rows[3].instructor.url, '/data/courses/1/instructors/1');
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
    this.set('course', this.linkedCourseWithTime);
    await render(
      <template>
        <VisualizeInstructorsGraph
          @course={{this.course}}
          @filter={{this.name}}
          @isIcon={{false}}
          @showDataTable={{true}}
        />
      </template>,
    );
    //let the chart animations finish
    await waitFor('.loaded');
    await waitFor('svg .bars');
    assert.strictEqual(component.chart.bars.length, 1);
    assert.strictEqual(component.chart.labels.length, 1);
    assert.strictEqual(component.chart.labels[0].text, 'Marie\u200b');
    assert.strictEqual(component.dataTable.rows.length, 1);
    assert.strictEqual(component.dataTable.rows[0].instructor.text, 'Marie');
  });

  test('sort data-table by instructor', async function (assert) {
    this.set('course', this.linkedCourseWithTime);
    await render(
      <template>
        <VisualizeInstructorsGraph
          @course={{this.course}}
          @isIcon={{false}}
          @showDataTable={{true}}
        />
      </template>,
    );
    assert.strictEqual(component.dataTable.rows[0].instructor.text, 'Daisy');
    assert.strictEqual(component.dataTable.rows[1].instructor.text, 'Duke');
    assert.strictEqual(component.dataTable.rows[2].instructor.text, 'William');
    assert.strictEqual(component.dataTable.rows[3].instructor.text, 'Marie');
    await component.dataTable.header.instructor.toggle();
    assert.strictEqual(component.dataTable.rows[0].instructor.text, 'Daisy');
    assert.strictEqual(component.dataTable.rows[1].instructor.text, 'Duke');
    assert.strictEqual(component.dataTable.rows[2].instructor.text, 'Marie');
    assert.strictEqual(component.dataTable.rows[3].instructor.text, 'William');
    await component.dataTable.header.instructor.toggle();
    assert.strictEqual(component.dataTable.rows[0].instructor.text, 'William');
    assert.strictEqual(component.dataTable.rows[1].instructor.text, 'Marie');
    assert.strictEqual(component.dataTable.rows[2].instructor.text, 'Duke');
    assert.strictEqual(component.dataTable.rows[3].instructor.text, 'Daisy');
  });

  test('sort data-table by sessions', async function (assert) {
    this.set('course', this.linkedCourseWithTime);
    await render(
      <template>
        <VisualizeInstructorsGraph
          @course={{this.course}}
          @isIcon={{false}}
          @showDataTable={{true}}
        />
      </template>,
    );
    assert.strictEqual(component.dataTable.rows[0].sessions.text, 'The San Leandro Horror');
    assert.strictEqual(component.dataTable.rows[1].sessions.text, 'The San Leandro Horror');
    assert.strictEqual(
      component.dataTable.rows[2].sessions.text,
      'Aardvark, Berkeley Investigations, The San Leandro Horror',
    );
    assert.strictEqual(
      component.dataTable.rows[3].sessions.text,
      'Berkeley Investigations, The San Leandro Horror',
    );
    await component.dataTable.header.sessions.toggle();
    assert.strictEqual(
      component.dataTable.rows[0].sessions.text,
      'Aardvark, Berkeley Investigations, The San Leandro Horror',
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
      'Aardvark, Berkeley Investigations, The San Leandro Horror',
    );
  });

  test('sort data-table by minutes', async function (assert) {
    this.set('course', this.linkedCourseWithTime);
    await render(
      <template>
        <VisualizeInstructorsGraph
          @course={{this.course}}
          @isIcon={{false}}
          @showDataTable={{true}}
        />
      </template>,
    );
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

  test('no data', async function (assert) {
    this.set('course', this.emptyCourse);
    await render(
      <template>
        <VisualizeInstructorsGraph
          @course={{this.course}}
          @isIcon={{false}}
          @showDataTable={{true}}
        />
      </template>,
    );
    assert.notOk(component.chart.isVisible);
    assert.notOk(component.dataTable.isVisible);
    assert.strictEqual(
      component.noData.text,
      'No instructors have been linked to any sessions in this course.',
    );
  });

  test('only zero time data', async function (assert) {
    this.set('course', this.linkedCourseWithoutTime);
    await render(
      <template>
        <VisualizeInstructorsGraph
          @course={{this.course}}
          @isIcon={{false}}
          @showDataTable={{true}}
        />
      </template>,
    );
    assert.notOk(component.chart.isVisible);
    assert.notOk(component.noData.isVisible);
    assert.strictEqual(component.dataTable.rows.length, 1);
    assert.strictEqual(component.dataTable.rows[0].instructor.text, 'Roland');
    assert.strictEqual(component.dataTable.rows[0].instructor.url, '/data/courses/2/instructors/5');
    assert.strictEqual(component.dataTable.rows[0].sessions.links.length, 1);
    assert.strictEqual(component.dataTable.rows[0].sessions.links[0].text, 'Two Slices of Pizza');
    assert.strictEqual(component.dataTable.rows[0].sessions.links[0].url, '/courses/2/sessions/3');
    assert.strictEqual(component.dataTable.rows[0].minutes, '0');
  });
});
