import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { setupIntl } from 'ember-intl/test-support';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { DateTime } from 'luxon';
import Service from '@ember/service';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { component } from 'ilios-common/page-objects/components/sessions-grid-row';

module('Integration | Component | sessions-grid-row', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
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

  test('it renders', async function (assert) {
    const date = DateTime.fromObject({ year: 2019, month: 7, day: 9, hour: 17 });
    const session = this.server.create('session');
    this.server.create('sessionType', { sessions: [session] });
    this.server.createList('term', 2, { sessions: [session] });
    this.server.createList('sessionObjective', 3, { session });
    const offering1 = this.server.create('offering', {
      session,
      startDate: date.toJSDate(),
    });
    const offering2 = this.server.create('offering', {
      session,
      startDate: date.plus({ hour: 1 }).toJSDate(),
    });
    this.server.create('learnerGroup', { offerings: [offering1] });
    this.server.createList('learnerGroup', 3, { offerings: [offering2] });
    const model = await this.owner.lookup('service:store').findRecord('session', session.id);
    this.set('session', model);
    await render(hbs`<SessionsGridRow
      @session={{this.session}}
      @confirmDelete={{(noop)}}
      @closeSession={{(noop)}}
      @expandSession={{(noop)}}
      @expandedSessionIds={{(array)}}
    />
`);
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
        month: 'numeric',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
      }),
    );
  });

  test('it renders expanded', async function (assert) {
    const session = this.server.create('session');
    const model = await this.owner.lookup('service:store').findRecord('session', session.id);
    this.set('session', model);
    this.set('expandedSessionIds', [session.id]);
    await render(hbs`<SessionsGridRow
      @session={{this.session}}
      @confirmDelete={{(noop)}}
      @closeSession={{(noop)}}
      @expandSession={{(noop)}}
      @expandedSessionIds={{this.expandedSessionIds}}
    />
`);
    assert.ok(component.isExpanded);
  });

  test('confirmDelete fires', async function (assert) {
    assert.expect(1);
    const session = this.server.create('session');
    const model = await this.owner.lookup('service:store').findRecord('session', session.id);
    this.set('session', model);
    this.set('confirmDelete', (s) => {
      assert.strictEqual(s, model.id);
    });
    await render(hbs`<SessionsGridRow
      @session={{this.session}}
      @confirmDelete={{this.confirmDelete}}
      @closeSession={{(noop)}}
      @expandSession={{(noop)}}
      @expandedSessionIds={{(array)}}
    />
`);
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
    await render(hbs`<SessionsGridRow
      @session={{this.session}}
      @confirmDelete={{(noop)}}
      @closeSession={{this.closeSession}}
      @expandSession={{(noop)}}
      @expandedSessionIds={{this.expandedSessionIds}}
    />
`);
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
    await render(hbs`<SessionsGridRow
      @session={{this.session}}
      @confirmDelete={{(noop)}}
      @closeSession={{(noop)}}
      @expandSession={{this.expandSession}}
      @expandedSessionIds={{(array)}}
    />
`);
    await component.expand();
  });
});
