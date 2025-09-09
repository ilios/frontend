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
        />
      </template>,
    );

    assert.strictEqual(component.header.title, 'Sessions (2)');
    assert.ok(component.sessionsGridHeader.expandCollapse.toggle.isVisible);
  });

  test('expandAllSessions argument causes all sessions with offerings to be expanded on load', async function (assert) {
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
          @expandAllSessions={{true}}
          @setExpandAllSessions={{(noop)}}
        />
      </template>,
    );

    assert.strictEqual(component.header.title, 'Sessions (2)');
    assert.ok(component.sessionsGridHeader.expandCollapse.toggle.isVisible);
    assert.ok(component.sessionsGridHeader.expandCollapse.allAreExpanded);
  });
});
