import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { setupMSW } from 'ilios-common/msw';
import noop from 'ilios-common/helpers/noop';
import { component } from 'ilios-common/page-objects/components/publish-all-sessions';
import PublishAllSessions from 'ilios-common/components/publish-all-sessions';

module('Integration | Component | publish all sessions', function (hooks) {
  setupRenderingTest(hooks);
  setupMSW(hooks);

  hooks.beforeEach(async function () {
    const programYearObjective = await this.server.create('program-year-objective');
    const term = await this.server.create('term');
    const linkedCourseObjective = await this.server.create('course-objective', {
      programYearObjectives: [programYearObjective],
    });
    const unlinkedCourseObjective = await this.server.create('course-objective');
    const unpublishableSession = await this.server.create('session', {
      title: 'session 1',
      published: false,
      terms: [term],
    });
    const completeSession = await this.server.create('session', {
      title: 'session 2',
      published: true,
      terms: [term],
    });
    const publishableSession = await this.server.create('session', {
      title: 'session 3',
      published: false,
    });
    const fullyPublishedButIncompleteSession = await this.server.create('session', {
      title: 'session 4',
      published: true,
    });
    const unpublishedAndIncompleteSession = await this.server.create('session', {
      title: 'session 5',
      published: true,
    });
    const unpublishedILMSession = await this.server.create('session', {
      title: 'session 6',
      published: false,
    });
    const publishedILMSession = await this.server.create('session', {
      title: 'session 7',
      published: true,
    });
    this.sortColumn = 'title';

    await this.server.create('session-objective', {
      session: completeSession,
      courseObjectives: [linkedCourseObjective],
    });
    await this.server.create('session-objective', {
      session: fullyPublishedButIncompleteSession,
    });
    await this.server.create('offering', { session: publishableSession });
    await this.server.create('offering', { session: completeSession });
    await this.server.create('offering', {
      session: fullyPublishedButIncompleteSession,
    });
    await this.server.create('offering', {
      session: unpublishedAndIncompleteSession,
    });
    await this.server.create('session-objective', { session: completeSession });
    await this.server.create('ilm-session', { session: unpublishedILMSession });
    await this.server.create('ilm-session', { session: publishedILMSession });
    const course = await this.server.create('course', {
      courseObjectives: [linkedCourseObjective, unlinkedCourseObjective],
      sessions: [
        unpublishableSession,
        completeSession,
        publishableSession,
        fullyPublishedButIncompleteSession,
        unpublishedAndIncompleteSession,
        unpublishedILMSession,
        publishedILMSession,
      ],
    });
    const store = this.owner.lookup('service:store');
    this.course = await store.findRecord('course', course.id);
  });

  test('it renders expanded', async function (assert) {
    this.set('course', this.course);

    await render(
      <template>
        <PublishAllSessions
          @course={{this.course}}
          @expandCompleteSessions={{true}}
          @expandIncompleteSessions={{true}}
          @setExpandCompleteSessions={{(noop)}}
          @setExpandIncompleteSessions={{(noop)}}
          @sortIncompleteBy={{this.sortColumn}}
          @setSortIncompleteBy={{(noop)}}
          @sortCompleteBy={{this.sortColumn}}
          @setSortCompleteBy={{(noop)}}
          @sortUnpublishedBy={{this.sortColumn}}
          @setSortUnpublishedBy={{(noop)}}
        />
      </template>,
    );
    assert.strictEqual(component.header.title, 'Publication Review');
    assert.strictEqual(
      component.unpublishableSessions.title,
      'Incomplete Sessions: cannot publish (1)',
    );
    assert.ok(component.unpublishableSessions.canExpandCollapse);
    assert.strictEqual(component.unpublishableSessions.sessions.length, 1);
    assert.strictEqual(component.unpublishableSessions.sessions[0].title, 'session 1');
    assert.strictEqual(component.unpublishableSessions.sessions[0].offerings, 'No');
    assert.strictEqual(component.unpublishableSessions.sessions[0].terms, 'Yes (1)');
    assert.strictEqual(component.unpublishableSessions.sessions[0].objectives.text, 'No');
    assert.notOk(component.unpublishableSessions.sessions[0].objectives.isLinked);
    assert.strictEqual(component.publishedSessions.title, 'Published Sessions (4)');
    assert.ok(component.publishedSessions.canExpandCollapse);
    assert.strictEqual(component.publishedSessions.sessions.length, 4);
    assert.strictEqual(component.publishedSessions.sessions[0].title, 'session 2');
    assert.strictEqual(component.publishedSessions.sessions[0].offerings, 'Yes (1)');
    assert.strictEqual(component.publishedSessions.sessions[0].terms, 'Yes (1)');
    assert.strictEqual(component.publishedSessions.sessions[0].objectives.text, 'Yes (2)');
    assert.ok(component.publishedSessions.sessions[0].objectives.isLinked);
    assert.strictEqual(component.overridableSessions.title, 'Unpublished Sessions: for review (2)');
    assert.ok(component.overridableSessions.markAllAsScheduled.isVisible);
    assert.ok(component.overridableSessions.publishAll.isVisible);
    assert.strictEqual(component.overridableSessions.sessions.length, 2);
    assert.ok(component.overridableSessions.publishAll.isVisible, 'publish all option visible');
    assert.ok(
      component.overridableSessions.markAllAsScheduled.isVisible,
      'mark all as scheduled option visible',
    );
    assert.ok(component.overridableSessions.sessions[0].publish.isChecked);
    assert.notOk(component.overridableSessions.sessions[0].markAsScheduled.isChecked);
    assert.strictEqual(component.overridableSessions.sessions[0].title, 'session 3');
    assert.strictEqual(component.overridableSessions.sessions[0].offerings, 'Yes (1)');
    assert.strictEqual(component.overridableSessions.sessions[0].terms, 'No');
    assert.strictEqual(component.overridableSessions.sessions[0].objectives.text, 'No');
    assert.notOk(component.overridableSessions.sessions[0].objectives.isLinked);

    await component.overridableSessions.sessions[0].publish.click();

    assert.strictEqual(
      component.review.confirmation,
      'Publish 2, schedule 0, leave 0, and ignore 5 sessions',
    );
  });

  test('it renders collapsed', async function (assert) {
    this.set('course', this.course);

    await render(
      <template>
        <PublishAllSessions
          @course={{this.course}}
          @expandCompleteSessions={{false}}
          @expandIncompleteSessions={{false}}
          @setExpandCompleteSessions={{(noop)}}
          @setExpandIncompleteSessions={{(noop)}}
          @sortIncompleteBy={{this.sortColumn}}
          @setSortIncompleteBy={{(noop)}}
          @sortCompleteBy={{this.sortColumn}}
          @setSortCompleteBy={{(noop)}}
          @sortUnpublishedBy={{this.sortColumn}}
          @setSortUnpublishedBy={{(noop)}}
        />
      </template>,
    );

    assert.strictEqual(component.header.title, 'Publication Review');

    assert.notOk(component.unpublishableSessions.isExpanded);
    assert.strictEqual(component.unpublishableSessions.sessions.length, 0);
    assert.strictEqual(
      component.unpublishableSessions.title,
      'Incomplete Sessions: cannot publish (1)',
    );
    assert.ok(component.unpublishableSessions.canExpandCollapse);

    assert.notOk(component.publishedSessions.isExpanded);
    assert.strictEqual(component.publishedSessions.sessions.length, 0);
    assert.strictEqual(component.publishedSessions.title, 'Published Sessions (4)');
    assert.ok(component.publishedSessions.canExpandCollapse);
  });

  test('expanding sections works', async function (assert) {
    this.set('course', this.course);
    this.set('setExpandCompleteSessions', (value) => assert.step(value.toString()));
    this.set('setExpandIncompleteSessions', (value) => assert.step(value.toString()));

    await render(
      <template>
        <PublishAllSessions
          @course={{this.course}}
          @expandCompleteSessions={{false}}
          @expandIncompleteSessions={{false}}
          @setExpandCompleteSessions={{this.setExpandCompleteSessions}}
          @setExpandIncompleteSessions={{this.setExpandIncompleteSessions}}
          @sortIncompleteBy={{this.sortColumn}}
          @setSortIncompleteBy={{(noop)}}
          @sortCompleteBy={{this.sortColumn}}
          @setSortCompleteBy={{(noop)}}
          @sortUnpublishedBy={{this.sortColumn}}
          @setSortUnpublishedBy={{(noop)}}
        />
      </template>,
    );
    await component.publishedSessions.toggle();
    await component.unpublishableSessions.toggle();
    assert.verifySteps(['true', 'true']);
  });

  test('collapsing sections works', async function (assert) {
    this.set('course', this.course);
    this.set('setExpandCompleteSessions', (value) => assert.step(value.toString()));
    this.set('setExpandIncompleteSessions', (value) => assert.step(value.toString()));

    await render(
      <template>
        <PublishAllSessions
          @course={{this.course}}
          @expandCompleteSessions={{true}}
          @expandIncompleteSessions={{true}}
          @setExpandCompleteSessions={{this.setExpandCompleteSessions}}
          @setExpandIncompleteSessions={{this.setExpandIncompleteSessions}}
          @sortIncompleteBy={{this.sortColumn}}
          @setSortIncompleteBy={{(noop)}}
          @sortCompleteBy={{this.sortColumn}}
          @setSortCompleteBy={{(noop)}}
          @sortUnpublishedBy={{this.sortColumn}}
          @setSortUnpublishedBy={{(noop)}}
        />
      </template>,
    );
    await component.publishedSessions.toggle();
    await component.unpublishableSessions.toggle();
    assert.verifySteps(['false', 'false']);
  });

  test('it renders empty', async function (assert) {
    const store = this.owner.lookup('service:store');
    const course = await this.server.create('course');
    const model = await store.findRecord('course', course.id);
    this.set('course', model);

    await render(
      <template>
        <PublishAllSessions
          @course={{this.course}}
          @setExpandCompleteSessions={{(noop)}}
          @setExpandIncompleteSessions={{(noop)}}
        />
      </template>,
    );

    assert.strictEqual(component.header.title, 'Publication Review');
    assert.strictEqual(
      component.unpublishableSessions.text,
      'Incomplete Sessions: cannot publish (0)',
    );
    assert.strictEqual(component.publishedSessions.text, 'Published Sessions (0)');
    assert.strictEqual(component.overridableSessions.title, 'Unpublished Sessions: for review (0)');
    assert.notOk(component.overridableSessions.markAllAsScheduled.isVisible);
    assert.notOk(component.overridableSessions.publishAll.isVisible);
    assert.strictEqual(component.overridableSessions.sessions.length, 0);
    assert.strictEqual(
      component.review.confirmation,
      'Publish 0, schedule 0, leave 0, and ignore 0 sessions',
    );
  });

  test('shows course objective warning', async function (assert) {
    this.set('course', this.course);

    await render(
      <template>
        <PublishAllSessions
          @course={{this.course}}
          @setExpandCompleteSessions={{(noop)}}
          @setExpandIncompleteSessions={{(noop)}}
          @sortIncompleteBy={{this.sortColumn}}
          @setSortIncompleteBy={{(noop)}}
          @sortCompleteBy={{this.sortColumn}}
          @setSortCompleteBy={{(noop)}}
          @sortUnpublishedBy={{this.sortColumn}}
          @setSortUnpublishedBy={{(noop)}}
        />
      </template>,
    );
    assert.strictEqual(
      component.review.unlinkedObjectivesWarning,
      'This course has unlinked objective(s)',
    );
    assert.ok(component.review.transitionToCourse.isVisible);
  });

  test('publish all overridable #2478', async function (assert) {
    this.set('course', this.course);

    await render(
      <template>
        <PublishAllSessions
          @course={{this.course}}
          @setExpandCompleteSessions={{(noop)}}
          @setExpandIncompleteSessions={{(noop)}}
          @sortIncompleteBy={{this.sortColumn}}
          @setSortIncompleteBy={{(noop)}}
          @sortCompleteBy={{this.sortColumn}}
          @setSortCompleteBy={{(noop)}}
          @sortUnpublishedBy={{this.sortColumn}}
          @setSortUnpublishedBy={{(noop)}}
        />
      </template>,
    );
    assert.strictEqual(
      component.review.confirmation,
      'Publish 2, schedule 0, leave 0, and ignore 5 sessions',
    );
    assert.strictEqual(component.overridableSessions.title, 'Unpublished Sessions: for review (2)');
    assert.ok(component.overridableSessions.markAllAsScheduled.isVisible);
    assert.ok(component.overridableSessions.publishAll.isVisible);
    const { sessions: list } = component.overridableSessions;
    assert.strictEqual(list.length, 2, 'list of overridable sessions correct');
    assert.ok(list[0].publish.isChecked);
    assert.notOk(list[0].markAsScheduled.isChecked);
    assert.notOk(list[0].leave.isChecked);
    assert.ok(list[1].publish.isChecked);
    assert.notOk(list[1].markAsScheduled.isChecked);
    assert.notOk(list[1].leave.isChecked);
    await component.overridableSessions.publishAll.click();
    assert.ok(list[0].publish.isChecked);
    assert.notOk(list[0].markAsScheduled.isChecked);
    assert.notOk(list[0].leave.isChecked);
    assert.ok(list[1].publish.isChecked);
    assert.notOk(list[1].markAsScheduled.isChecked);
    assert.notOk(list[1].leave.isChecked);

    assert.strictEqual(
      component.review.confirmation,
      'Publish 2, schedule 0, leave 0, and ignore 5 sessions',
    );
  });

  test('schedule all overridable #2478', async function (assert) {
    this.set('course', this.course);

    await render(
      <template>
        <PublishAllSessions
          @course={{this.course}}
          @setExpandCompleteSessions={{(noop)}}
          @setExpandIncompleteSessions={{(noop)}}
          @sortIncompleteBy={{this.sortColumn}}
          @setSortIncompleteBy={{(noop)}}
          @sortCompleteBy={{this.sortColumn}}
          @setSortCompleteBy={{(noop)}}
          @sortUnpublishedBy={{this.sortColumn}}
          @setSortUnpublishedBy={{(noop)}}
        />
      </template>,
    );
    assert.strictEqual(
      component.review.confirmation,
      'Publish 2, schedule 0, leave 0, and ignore 5 sessions',
    );
    assert.strictEqual(component.overridableSessions.title, 'Unpublished Sessions: for review (2)');
    assert.ok(component.overridableSessions.markAllAsScheduled.isVisible);
    assert.ok(component.overridableSessions.publishAll.isVisible);
    const { sessions: list } = component.overridableSessions;
    assert.strictEqual(list.length, 2);
    assert.ok(list[0].publish.isChecked);
    assert.notOk(list[0].markAsScheduled.isChecked);
    assert.notOk(list[0].leave.isChecked);
    assert.ok(list[1].publish.isChecked);
    assert.notOk(list[1].markAsScheduled.isChecked);
    assert.notOk(list[1].leave.isChecked);

    assert.strictEqual(
      component.review.confirmation,
      'Publish 2, schedule 0, leave 0, and ignore 5 sessions',
    );
    await component.overridableSessions.markAllAsScheduled.click();
    assert.notOk(list[0].publish.isChecked);
    assert.ok(list[0].markAsScheduled.isChecked);
    assert.notOk(list[0].leave.isChecked);
    assert.notOk(list[1].publish.isChecked);
    assert.ok(list[1].markAsScheduled.isChecked);
    assert.notOk(list[1].leave.isChecked);

    assert.strictEqual(
      component.review.confirmation,
      'Publish 0, schedule 2, leave 0, and ignore 5 sessions',
    );
  });

  test('publish/schedule individual sessions', async function (assert) {
    this.set('course', this.course);

    await render(
      <template>
        <PublishAllSessions
          @course={{this.course}}
          @setExpandCompleteSessions={{(noop)}}
          @setExpandIncompleteSessions={{(noop)}}
          @sortIncompleteBy={{this.sortColumn}}
          @setSortIncompleteBy={{(noop)}}
          @sortCompleteBy={{this.sortColumn}}
          @setSortCompleteBy={{(noop)}}
          @sortUnpublishedBy={{this.sortColumn}}
          @setSortUnpublishedBy={{(noop)}}
        />
      </template>,
    );
    assert.strictEqual(
      component.review.confirmation,
      'Publish 2, schedule 0, leave 0, and ignore 5 sessions',
    );
    assert.strictEqual(component.overridableSessions.title, 'Unpublished Sessions: for review (2)');
    assert.ok(component.overridableSessions.markAllAsScheduled.isVisible);
    assert.ok(component.overridableSessions.publishAll.isVisible);
    const { sessions: list } = component.overridableSessions;

    assert.strictEqual(list.length, 2);
    assert.ok(component.overridableSessions.publishAll.isChecked);
    assert.notOk(component.overridableSessions.markAllAsScheduled.isChecked);
    assert.ok(list[0].publish.isChecked);
    assert.notOk(list[0].markAsScheduled.isChecked);
    assert.notOk(list[0].leave.isChecked);
    assert.ok(list[1].publish.isChecked);
    assert.notOk(list[1].markAsScheduled.isChecked);
    assert.notOk(list[1].leave.isChecked);
    await component.overridableSessions.publishAll.click();
    assert.ok(component.overridableSessions.publishAll.isChecked);
    assert.notOk(component.overridableSessions.markAllAsScheduled.isChecked);
    assert.ok(list[0].publish.isChecked);
    assert.notOk(list[0].markAsScheduled.isChecked);
    assert.notOk(list[0].leave.isChecked);
    assert.ok(list[1].publish.isChecked);
    assert.notOk(list[1].markAsScheduled.isChecked);
    assert.notOk(list[1].leave.isChecked);
    await list[0].markAsScheduled.click();
    assert.notOk(component.overridableSessions.publishAll.isChecked);
    assert.notOk(component.overridableSessions.markAllAsScheduled.isChecked);
    assert.notOk(list[0].publish.isChecked);
    assert.ok(list[0].markAsScheduled.isChecked);
    assert.notOk(list[0].leave.isChecked);
    assert.ok(list[1].publish.isChecked);
    assert.notOk(list[1].markAsScheduled.isChecked);
    assert.notOk(list[1].leave.isChecked);
    await list[1].markAsScheduled.click();
    assert.notOk(component.overridableSessions.publishAll.isChecked);
    assert.ok(component.overridableSessions.markAllAsScheduled.isChecked);
    assert.notOk(list[0].publish.isChecked);
    assert.ok(list[0].markAsScheduled.isChecked);
    assert.notOk(list[0].leave.isChecked);
    assert.notOk(list[1].publish.isChecked);
    assert.ok(list[1].markAsScheduled.isChecked);
    assert.notOk(list[1].leave.isChecked);
    await component.overridableSessions.publishAll.click();
    assert.ok(component.overridableSessions.publishAll.isChecked);
    assert.notOk(component.overridableSessions.markAllAsScheduled.isChecked);
    assert.ok(list[0].publish.isChecked);
    assert.notOk(list[0].markAsScheduled.isChecked);
    assert.notOk(list[0].leave.isChecked);
    assert.ok(list[1].publish.isChecked);
    assert.notOk(list[1].markAsScheduled.isChecked);
    assert.notOk(list[1].leave.isChecked);

    assert.strictEqual(
      component.review.confirmation,
      'Publish 2, schedule 0, leave 0, and ignore 5 sessions',
    );
  });
});
