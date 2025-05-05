import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { setupMirage } from 'test-app/tests/test-support/mirage';
import { DateTime } from 'luxon';
import { render } from '@ember/test-helpers';
import Service from '@ember/service';
import { component } from 'ilios-common/page-objects/components/sessions-grid-row';
import SessionsGridRow from 'ilios-common/components/sessions-grid-row';
import noop from 'ilios-common/helpers/noop';
import { array } from '@ember/helper';

module('Integration | Component | sessions-grid-row', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function () {
    this.intl = this.owner.lookup('service:intl');
  });

  test('it renders', async function (assert) {
    const date = DateTime.fromObject({ year: 2019, month: 7, day: 9, hour: 17 });
    const session = this.server.create('session');
    this.server.create('session-type', { sessions: [session] });
    this.server.createList('term', 2, { sessions: [session] });
    this.server.createList('session-objective', 3, { session });
    const offering1 = this.server.create('offering', {
      session,
      startDate: date.toJSDate(),
    });
    const offering2 = this.server.create('offering', {
      session,
      startDate: date.plus({ hour: 1 }).toJSDate(),
    });
    this.server.create('learner-group', { offerings: [offering1] });
    this.server.createList('learner-group', 3, { offerings: [offering2] });
    const model = await this.owner.lookup('service:store').findRecord('session', session.id);
    this.set('session', model);
    await render(
      <template>
        <SessionsGridRow
          @session={{this.session}}
          @confirmDelete={{(noop)}}
          @closeSession={{(noop)}}
          @expandSession={{(noop)}}
          @expandedSessionIds={{(array)}}
        />
      </template>,
    );
    assert.ok(component.isCollapsed);
    assert.strictEqual(component.title, 'session 0');
    assert.strictEqual(component.type, 'session type 0');
    assert.strictEqual(component.groupCount, '4');
    assert.strictEqual(component.objectiveCount, '3');
    assert.strictEqual(component.termCount, '2');
    assert.strictEqual(component.offeringCount, '2');
    assert.notOk(component.hasInstructionalNotes);
    assert.notOk(component.hasPrerequisites);
    assert.strictEqual(
      component.firstOffering,
      this.intl.formatDate(date.toJSDate(), {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    );
  });

  test('it renders expanded', async function (assert) {
    const session = this.server.create('session');
    const model = await this.owner.lookup('service:store').findRecord('session', session.id);
    this.set('session', model);
    this.set('expandedSessionIds', [session.id]);
    await render(
      <template>
        <SessionsGridRow
          @session={{this.session}}
          @confirmDelete={{(noop)}}
          @closeSession={{(noop)}}
          @expandSession={{(noop)}}
          @expandedSessionIds={{this.expandedSessionIds}}
        />
      </template>,
    );
    assert.ok(component.isExpanded);
  });

  test('confirmDelete fires', async function (assert) {
    assert.expect(1);
    class PermissionCheckerServiceMock extends Service {
      async canDeleteSession() {
        return true;
      }
      async canUpdateSession() {
        return true;
      }
    }
    this.owner.register('service:permission-checker', PermissionCheckerServiceMock);
    const session = this.server.create('session');
    const model = await this.owner.lookup('service:store').findRecord('session', session.id);
    this.set('session', model);
    this.set('confirmDelete', (s) => {
      assert.strictEqual(s, model.id);
    });
    await render(
      <template>
        <SessionsGridRow
          @session={{this.session}}
          @confirmDelete={{this.confirmDelete}}
          @closeSession={{(noop)}}
          @expandSession={{(noop)}}
          @expandedSessionIds={{(array)}}
        />
      </template>,
    );
    await component.trash();
  });

  test('closeSession fires', async function (assert) {
    assert.expect(1);
    const session = this.server.create('session');
    const model = await this.owner.lookup('service:store').findRecord('session', session.id);
    this.set('session', model);
    this.set('expandedSessionIds', [session.id]);
    this.set('closeSession', (s) => {
      assert.strictEqual(s, model);
    });
    await render(
      <template>
        <SessionsGridRow
          @session={{this.session}}
          @confirmDelete={{(noop)}}
          @closeSession={{this.closeSession}}
          @expandSession={{(noop)}}
          @expandedSessionIds={{this.expandedSessionIds}}
        />
      </template>,
    );
    await component.collapse();
  });

  test('expandSession fires', async function (assert) {
    assert.expect(1);
    const session = this.server.create('session');
    this.server.create('offering', { session });
    const model = await this.owner.lookup('service:store').findRecord('session', session.id);
    this.set('session', model);
    this.set('expandedSessionIds', [session.id]);
    this.set('expandSession', (s) => {
      assert.strictEqual(s, model);
    });
    await render(
      <template>
        <SessionsGridRow
          @session={{this.session}}
          @confirmDelete={{(noop)}}
          @closeSession={{(noop)}}
          @expandSession={{this.expandSession}}
          @expandedSessionIds={{(array)}}
        />
      </template>,
    );
    await component.expand();
  });
});
