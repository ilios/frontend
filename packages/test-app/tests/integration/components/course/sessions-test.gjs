import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import Service from '@ember/service';
import { setupMirage } from 'test-app/tests/test-support/mirage';
import { component } from 'ilios-common/page-objects/components/course/sessions';
import Sessions from 'ilios-common/components/course/sessions';
import noop from 'ilios-common/helpers/noop';

module('Integration | Component | course/sessions', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    class PermissionCheckerStub extends Service {
      canDeleteSession() {
        return true;
      }
      canUpdateSession() {
        return true;
      }
    }

    this.owner.register('service:permissionChecker', PermissionCheckerStub);
  });

  test('it renders', async function (assert) {
    const school = this.server.create('school');
    const course = this.server.create('course', { school });
    const courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);
    this.set('course', courseModel);
    await render(
      <template>
        <Sessions
          @course={{this.course}}
          @sortBy="title"
          @setSortBy={{(noop)}}
          @filterBy={{null}}
          @setFilterBy={{(noop)}}
        />
      </template>,
    );

    assert.strictEqual(component.header.title, 'Sessions (0)');
    assert.notOk(component.sessionsGridHeader.expandCollapse.toggle.isVisible);
  });

  test('expand/collapse all session not visible if no session with offerings in list', async function (assert) {
    const school = this.server.create('school');
    const course = this.server.create('course', { school });
    const sessionType = this.server.create('session-type', { school });
    this.server.createList('session', 2, { course, sessionType });
    const courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);
    this.set('course', courseModel);
    await render(
      <template>
        <Sessions
          @course={{this.course}}
          @sortBy="title"
          @setSortBy={{(noop)}}
          @filterBy={{null}}
          @setFilterBy={{(noop)}}
        />
      </template>,
    );

    assert.strictEqual(component.header.title, 'Sessions (2)');
    assert.notOk(component.sessionsGridHeader.expandCollapse.toggle.isVisible);
  });

  test('expand/collapse all session is visible if at least one session in list has offerings', async function (assert) {
    const school = this.server.create('school');
    const course = this.server.create('course', { school });
    const sessionType = this.server.create('session-type', { school });
    const sessions = this.server.createList('session', 2, { course, sessionType });
    this.server.create('offering', {
      session: sessions[0],
    });
    const courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);
    this.set('course', courseModel);
    await render(
      <template>
        <Sessions
          @course={{this.course}}
          @sortBy="title"
          @setSortBy={{(noop)}}
          @filterBy={{null}}
          @setFilterBy={{(noop)}}
          @expandedSessionIds={{null}}
          @setExpandedSessionIds={{(noop)}}
        />
      </template>,
    );

    assert.strictEqual(component.header.title, 'Sessions (2)', 'header title is correct');
    assert.ok(
      component.sessionsGridHeader.expandCollapse.toggle.isVisible,
      'expand all toggle is visible',
    );
  });

  test('previously expanded sessions are re-expanded', async function (assert) {
    const school = this.server.create('school');
    const course = this.server.create('course', { school });
    const sessionType = this.server.create('session-type', { school });
    const sessions = this.server.createList('session', 3, { course, sessionType });
    this.server.create('offering', {
      session: sessions[0],
    });
    this.server.create('offering', {
      session: sessions[1],
    });
    const courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);
    this.set('course', courseModel);
    this.set('expandedSessionIds', ['1', '2']);
    await render(
      <template>
        <Sessions
          @course={{this.course}}
          @sortBy="title"
          @setSortBy={{(noop)}}
          @filterBy={{null}}
          @setFilterBy={{(noop)}}
          @expandedSessionIds={{this.expandedSessionIds}}
        />
      </template>,
    );

    assert.strictEqual(component.header.title, 'Sessions (3)', 'header title is correct');

    assert.ok(component.sessionsGrid.sessions[0].row.isExpanded, 'first session row is expanded');
    assert.ok(component.sessionsGrid.sessions[1].row.isExpanded, 'second session row is expanded');
    assert.notOk(
      component.sessionsGrid.sessions[2].row.isExpanded,
      'third session row is not expanded',
    );
  });
});
