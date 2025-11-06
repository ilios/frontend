import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import Service from '@ember/service';
import { click, render } from '@ember/test-helpers';
import { setupMirage } from 'test-app/tests/test-support/mirage';
import { component } from 'ilios-common/page-objects/components/sessions-grid';
import SessionsGrid from 'ilios-common/components/sessions-grid';
import noop from 'ilios-common/helpers/noop';

module('Integration | Component | sessions-grid', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function () {
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

  test('it renders with no results', async function (assert) {
    this.set('sessions', []);
    this.set('sortBy', 'title');
    await render(
      <template>
        <SessionsGrid @sessions={{this.sessions}} @sortBy={{this.sortBy}} @setSortBy={{(noop)}} />
      </template>,
    );
    assert.dom(this.element).hasText('No results found. Please try again.');
  });

  test('it renders with prereq', async function (assert) {
    const school = this.server.create('school');
    const course = this.server.create('course', { school });
    const sessionType = this.server.create('session-type', { school });
    this.server.createList('instructor-group', 5, { school });
    this.server.createList('user', 2, { instructorGroupIds: [1] });
    this.server.createList('user', 3, { instructorGroupIds: [2] });

    const ilmSession = this.server.create('ilm-session', {
      instructorGroupIds: [1, 2, 3],
      instructorIds: [2, 3, 4],
    });
    const session1 = this.server.create('session', {
      course,
      ilmSession,
      sessionType,
    });
    const session2 = this.server.create('session', { course, prerequisites: [session1] });
    const sessionModel1 = await this.owner
      .lookup('service:store')
      .findRecord('session', session1.id);
    const sessionModel2 = await this.owner
      .lookup('service:store')
      .findRecord('session', session2.id);
    this.set('sessions', [sessionModel1, sessionModel2]);
    this.set('expandedSessionIds', [session1.id, session2.id]);
    await render(
      <template>
        <SessionsGrid
          @sessions={{this.sessions}}
          @sortBy="title"
          @setSortBy={{(noop)}}
          @expandSession={{(noop)}}
          @expandedSessionIds={{this.expandedSessionIds}}
        />
      </template>,
    );

    assert.strictEqual(component.sessions[1].row.prerequisites.title, 'Prerequisites: session 0');
  });

  test('clicking expand fires action', async function (assert) {
    const course = this.server.create('course');
    const session = this.server.create('session', { course });
    this.server.create('offering', { session });
    const sessionModel = await this.owner.lookup('service:store').findRecord('session', session.id);
    this.set('sessions', [sessionModel]);
    this.set('sortBy', 'title');
    this.set('expandSession', (s) => {
      assert.step('expandSession called');
      assert.strictEqual(s, sessionModel);
    });
    await render(
      <template>
        <SessionsGrid
          @sessions={{this.sessions}}
          @sortBy={{this.sortBy}}
          @setSortBy={{(noop)}}
          @expandSession={{this.expandSession}}
        />
      </template>,
    );
    await click('[data-test-expand-collapse-control] svg');
    assert.verifySteps(['expandSession called']);
  });

  test('clicking expand does not fire action when there are no offerings', async function (assert) {
    const course = this.server.create('course');
    const session = this.server.create('session', { course });
    const sessionModel = await this.owner.lookup('service:store').findRecord('session', session.id);
    this.set('sessions', [sessionModel]);
    this.set('sortBy', 'title');
    this.set('expandSession', () => {
      assert.step('expandSession called');
    });
    await render(
      <template>
        <SessionsGrid
          @sessions={{this.sessions}}
          @sortBy={{this.sortBy}}
          @setSortBy={{(noop)}}
          @expandSession={{this.expandSession}}
        />
      </template>,
    );
    await click('[data-test-expand-collapse-control] svg');
    assert.verifySteps([]);
  });

  // @see issue ilios/common#1820 [ST 2020/12/10]
  test('deletion of session is disabled if it has prerequisites', async function (assert) {
    const course = this.server.create('course');
    const session1 = this.server.create('session', { course });
    const session2 = this.server.create('session', { course, postrequisite: session1 });
    const sessionModel1 = await this.owner
      .lookup('service:store')
      .findRecord('session', session1.id);
    const sessionModel2 = await this.owner
      .lookup('service:store')
      .findRecord('session', session2.id);
    this.set('sessions', [sessionModel1, sessionModel2]);
    await render(
      <template>
        <SessionsGrid
          @sessions={{this.sessions}}
          @sortBy="title"
          @setSortBy={{(noop)}}
          @expandSession={{(noop)}}
        />
      </template>,
    );
    assert.dom('[data-test-session]:nth-of-type(1) [data-test-delete-disabled]').isVisible();
    assert.dom('[data-test-session]:nth-of-type(1) [data-test-delete]').isNotVisible();
    assert.dom('[data-test-session]:nth-of-type(2) [data-test-delete-disabled]').isNotVisible();
    assert.dom('[data-test-session]:nth-of-type(2) [data-test-delete]').isVisible();
  });

  test('multiple sessions with the same title', async function (assert) {
    const course = this.server.create('course');
    const session1 = this.server.create('session', { course, title: 'super duper' });
    const session2 = this.server.create('session', { course, title: 'super duper' });
    const session3 = this.server.create('session', { course, title: 'zeppelin' });
    this.server.create('offering', { session: session1 });
    const sessionModel1 = await this.owner
      .lookup('service:store')
      .findRecord('session', session1.id);
    const sessionModel2 = await this.owner
      .lookup('service:store')
      .findRecord('session', session2.id);
    const sessionModel3 = await this.owner
      .lookup('service:store')
      .findRecord('session', session3.id);
    this.set('sessions', [sessionModel1, sessionModel2, sessionModel3]);
    this.set('sortBy', 'title');
    await render(
      <template>
        <SessionsGrid @sessions={{this.sessions}} @sortBy={{this.sortBy}} @setSortBy={{(noop)}} />
      </template>,
    );
    assert.strictEqual(component.sessions[0].row.title, 'super duper');
    assert.strictEqual(component.sessions[0].row.titleAriaLabel, 'super duper');
    assert.strictEqual(component.sessions[1].row.title, 'super duper');
    assert.strictEqual(component.sessions[1].row.titleAriaLabel, 'super duper, 2');
    assert.strictEqual(component.sessions[2].row.title, 'zeppelin');
    assert.strictEqual(component.sessions[2].row.titleAriaLabel, 'zeppelin');
  });
});
