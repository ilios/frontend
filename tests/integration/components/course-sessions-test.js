import { module, test } from 'qunit';
import { setupRenderingTest } from 'dummy/tests/helpers';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import Service from '@ember/service';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { component } from 'ilios-common/page-objects/components/course-sessions';

module('Integration | Component | course sessions', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
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
    await render(hbs`<CourseSessions
      @course={{this.course}}
      @sortBy="title"
      @setSortBy={{(noop)}}
      @filterBy={{null}}
      @setFilterBy={{(noop)}}
    />`);

    assert.strictEqual(component.header.title, 'Sessions (0)');
    assert.notOk(component.sessionsGridHeader.expandCollapse.toggle.isVisible);
  });

  test('expand/collapse all session not visible if no session with offerings in list', async function (assert) {
    const school = this.server.create('school');
    const course = this.server.create('course', { school });
    const sessionType = this.server.create('sessionType', { school });
    this.server.createList('session', 2, { course, sessionType });
    const courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);
    this.set('course', courseModel);
    await render(hbs`<CourseSessions
      @course={{this.course}}
      @sortBy="title"
      @setSortBy={{(noop)}}
      @filterBy={{null}}
      @setFilterBy={{(noop)}}
    />`);

    assert.strictEqual(component.header.title, 'Sessions (2)');
    assert.notOk(component.sessionsGridHeader.expandCollapse.toggle.isVisible);
  });

  test('expand/collapse all session is visible if at least one session in list has offerings', async function (assert) {
    const school = this.server.create('school');
    const course = this.server.create('course', { school });
    const sessionType = this.server.create('sessionType', { school });
    const sessions = this.server.createList('session', 2, { course, sessionType });
    this.server.create('offering', {
      session: sessions[0],
    });
    const courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);
    this.set('course', courseModel);
    await render(hbs`<CourseSessions
      @course={{this.course}}
      @sortBy="title"
      @setSortBy={{(noop)}}
      @filterBy={{null}}
      @setFilterBy={{(noop)}}
    />`);

    assert.strictEqual(component.header.title, 'Sessions (2)');
    assert.ok(component.sessionsGridHeader.expandCollapse.toggle.isVisible);
  });
});
