import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render, waitFor } from '@ember/test-helpers';
import { setupMirage } from 'test-app/tests/test-support/mirage';
import { component } from 'ilios-common/page-objects/components/course/visualize-instructor-session-type-graph';
import VisualizeInstructorSessionTypeGraph from 'ilios-common/components/course/visualize-instructor-session-type-graph';

module(
  'Integration | Component | course/visualize-instructor-session-type-graph',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);

    hooks.beforeEach(async function () {
      const instructor = this.server.create('user');
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
      const session3 = this.server.create('session', {
        title: 'Two Slices of Pizza',
        course: linkedCourseWithoutTime,
        sessionType: sessionType3,
      });
      const session4 = this.server.create('session', {
        title: 'Aardvark',
        course: linkedCourseWithTime,
        sessionType: sessionType2,
      });
      this.server.create('offering', {
        session: session1,
        startDate: new Date('2019-12-08T12:00:00'),
        endDate: new Date('2019-12-08T17:00:00'),
        instructors: [instructor],
      });
      this.server.create('offering', {
        session: session1,
        startDate: new Date('2019-12-21T12:00:00'),
        endDate: new Date('2019-12-21T17:30:00'),
        instructors: [instructor],
      });
      this.server.create('offering', {
        session: session2,
        startDate: new Date('2019-12-05T18:00:00'),
        endDate: new Date('2019-12-05T21:00:00'),
        instructors: [instructor],
      });
      this.server.create('offering', {
        session: session3,
        startDate: new Date('2019-12-05T18:00:00'),
        endDate: new Date('2019-12-05T18:00:00'),
        instructors: [instructor],
      });
      this.server.create('offering', {
        session: session4,
        startDate: new Date('2019-12-05T18:00:00'),
        endDate: new Date('2019-12-05T18:00:00'),
        instructors: [instructor],
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
      this.instructor = await this.owner.lookup('service:store').findRecord('user', instructor.id);
    });

    test('it renders', async function (assert) {
      this.set('course', this.linkedCourseWithTime);
      this.set('instructor', this.instructor);
      await render(
        <template>
          <VisualizeInstructorSessionTypeGraph
            @course={{this.course}}
            @user={{this.instructor}}
            @isIcon={{false}}
            @showDataTable={{true}}
          />
        </template>,
      );
      assert.notOk(component.noData.isVisible);
      await waitFor('.loaded');
      await waitFor('svg .slice');
      assert.strictEqual(component.chart.slices.length, 2);
      assert.strictEqual(component.chart.descriptions.length, 2);
      assert.strictEqual(component.chart.descriptions[0].text, 'Campaign - 180 Minutes');
      assert.strictEqual(component.chart.descriptions[1].text, 'Standalone - 630 Minutes');
      assert.strictEqual(component.chart.labels.length, 2);
      assert.ok(component.chart.labels[0].text.startsWith('Campaign'));
      assert.ok(component.chart.labels[1].text.startsWith('Standalone'));
      assert.ok(component.dataTable.actions.download.isVisible);
      assert.strictEqual(component.dataTable.rows.length, 2);
      assert.strictEqual(component.dataTable.rows[0].sessionType, 'Campaign');
      assert.strictEqual(component.dataTable.rows[0].sessions.links.length, 2);
      assert.strictEqual(component.dataTable.rows[0].sessions.links[0].text, 'Aardvark');
      assert.strictEqual(component.dataTable.rows[0].sessions.links[0].ariaLabel, 'Aardvark');
      assert.strictEqual(
        component.dataTable.rows[0].sessions.links[0].url,
        '/courses/1/sessions/4',
      );
      assert.strictEqual(
        component.dataTable.rows[0].sessions.links[1].text,
        'The San Leandro Horror',
      );
      assert.strictEqual(
        component.dataTable.rows[0].sessions.links[1].ariaLabel,
        'The San Leandro Horror',
      );
      assert.strictEqual(
        component.dataTable.rows[0].sessions.links[1].url,
        '/courses/1/sessions/2',
      );
      assert.strictEqual(component.dataTable.rows[0].minutes, '180');
      assert.strictEqual(component.dataTable.rows[1].sessionType, 'Standalone');
      assert.strictEqual(component.dataTable.rows[1].sessions.links.length, 1);
      assert.strictEqual(
        component.dataTable.rows[1].sessions.links[0].text,
        'Berkeley Investigations',
      );
      assert.strictEqual(
        component.dataTable.rows[1].sessions.links[0].ariaLabel,
        'Berkeley Investigations',
      );
      assert.strictEqual(
        component.dataTable.rows[1].sessions.links[0].url,
        '/courses/1/sessions/1',
      );
      assert.strictEqual(component.dataTable.rows[1].minutes, '630');
    });

    test('sort data-table by session type', async function (assert) {
      this.set('course', this.linkedCourseWithTime);
      this.set('instructor', this.instructor);
      await render(
        <template>
          <VisualizeInstructorSessionTypeGraph
            @course={{this.course}}
            @user={{this.instructor}}
            @isIcon={{false}}
            @showDataTable={{true}}
          />
        </template>,
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
      this.set('course', this.linkedCourseWithTime);
      this.set('instructor', this.instructor);
      await render(
        <template>
          <VisualizeInstructorSessionTypeGraph
            @course={{this.course}}
            @user={{this.instructor}}
            @isIcon={{false}}
            @showDataTable={{true}}
          />
        </template>,
      );
      assert.strictEqual(
        component.dataTable.rows[0].sessions.text,
        'Aardvark, The San Leandro Horror',
      );
      assert.strictEqual(component.dataTable.rows[1].sessions.text, 'Berkeley Investigations');
      await component.dataTable.header.sessions.toggle();
      assert.strictEqual(
        component.dataTable.rows[0].sessions.text,
        'Aardvark, The San Leandro Horror',
      );
      assert.strictEqual(component.dataTable.rows[1].sessions.text, 'Berkeley Investigations');
      await component.dataTable.header.sessions.toggle();
      assert.strictEqual(component.dataTable.rows[0].sessions.text, 'Berkeley Investigations');
      assert.strictEqual(
        component.dataTable.rows[1].sessions.text,
        'Aardvark, The San Leandro Horror',
      );
      await component.dataTable.header.sessions.toggle();
      assert.strictEqual(
        component.dataTable.rows[0].sessions.text,
        'Aardvark, The San Leandro Horror',
      );
      assert.strictEqual(component.dataTable.rows[1].sessions.text, 'Berkeley Investigations');
    });

    test('sort data-table by minutes', async function (assert) {
      this.set('course', this.linkedCourseWithTime);
      this.set('instructor', this.instructor);
      await render(
        <template>
          <VisualizeInstructorSessionTypeGraph
            @course={{this.course}}
            @user={{this.instructor}}
            @isIcon={{false}}
            @showDataTable={{true}}
          />
        </template>,
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

    test('no data', async function (assert) {
      this.set('course', this.emptyCourse);
      this.set('instructor', this.instructor);
      await render(
        <template>
          <VisualizeInstructorSessionTypeGraph
            @course={{this.course}}
            @user={{this.instructor}}
            @isIcon={{false}}
            @showDataTable={{true}}
          />
        </template>,
      );
      assert.notOk(component.chart.isVisible);
      assert.notOk(component.dataTable.isVisible);
      assert.strictEqual(
        component.noData.text,
        '0 guy M. Mc0son is not instructing any sessions in this course.',
      );
    });

    test('only zero time data', async function (assert) {
      this.set('course', this.linkedCourseWithoutTime);
      this.set('instructor', this.instructor);
      await render(
        <template>
          <VisualizeInstructorSessionTypeGraph
            @course={{this.course}}
            @user={{this.instructor}}
            @isIcon={{false}}
            @showDataTable={{true}}
          />
        </template>,
      );
      assert.notOk(component.chart.isVisible);
      assert.notOk(component.noData.isVisible);
      assert.strictEqual(component.dataTable.rows.length, 1);
      assert.strictEqual(component.dataTable.rows[0].sessionType, 'Prelude');
      assert.strictEqual(component.dataTable.rows[0].sessions.links.length, 1);
      assert.strictEqual(component.dataTable.rows[0].sessions.links[0].text, 'Two Slices of Pizza');
      assert.strictEqual(
        component.dataTable.rows[0].sessions.links[0].url,
        '/courses/2/sessions/3',
      );
      assert.strictEqual(component.dataTable.rows[0].minutes, '0');
    });
  },
);
