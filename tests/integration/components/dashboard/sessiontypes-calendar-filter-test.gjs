import { array } from '@ember/helper';
import { render } from '@ember/test-helpers';
import { a11yAudit } from 'ember-a11y-testing/test-support';
import SessionTypesCalendarFilter from 'frontend/components/dashboard/sessiontypes-calendar-filter';
import noop from 'frontend/helpers/noop';
import { setupAuthentication, setupRenderingTest } from 'frontend/tests/helpers';
import { setupMSW } from 'frontend/tests/msw';
import { component } from 'frontend/tests/pages/components/dashboard/sessiontypes-calendar-filter';
import { module, test } from 'qunit';

module('Integration | Component | dashboard/sessiontypes-calendar-filter', function (hooks) {
  setupRenderingTest(hooks);
  setupMSW(hooks);

  hooks.beforeEach(async function () {
    this.school = await this.server.create('school');
    await setupAuthentication({ school: this.school, administeredSchools: [this.school] });
    await this.server.create('session-type', {
      title: 'Session Type 1',
      calendarColor: '#cc0000',
      school: this.school,
    });
    await this.server.create('session-type', {
      title: 'Session Type 2',
      calendarColor: '#00cc00',
      school: this.school,
    });
    await this.server.create('session-type', {
      title: 'Session Type 3',
      calendarColor: '#0000cc',
      school: this.school,
    });
    await this.server.create('session-type', {
      title: 'Session Type 4',
      calendarColor: '#00cccc',
      school: this.school,
    });
  });

  test('it renders and is accessible', async function (assert) {
    await render(
      <template>
        <SessionTypesCalendarFilter @school={{this.school}} @add={{(noop)}} @remove={{(noop)}} />
      </template>,
    );
    assert.strictEqual(component.sessionTypes.length, 4);
    assert.strictEqual(component.sessionTypes[0].title, 'Session Type 1');
    assert.strictEqual(component.sessionTypes[1].title, 'Session Type 2');
    assert.strictEqual(component.sessionTypes[2].title, 'Session Type 3');
    assert.strictEqual(component.sessionTypes[3].title, 'Session Type 4');

    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('it renders empty and is accessible', async function (assert) {
    const school = await this.server.create('school');
    await render(
      <template>
        <SessionTypesCalendarFilter @school={{school}} @add={{(noop)}} @remove={{(noop)}} />
      </template>,
    );

    assert.strictEqual(component.sessionTypes.length, 0);

    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('selected session types are checked', async function (assert) {
    await render(
      <template>
        <SessionTypesCalendarFilter
          @school={{this.school}}
          @selectedIds={{array 2 3}}
          @add={{(noop)}}
          @remove={{(noop)}}
        />
      </template>,
    );

    assert.strictEqual(component.sessionTypes.length, 4);
    assert.strictEqual(component.sessionTypes[0].title, 'Session Type 1');
    assert.notOk(component.sessionTypes[0].isChecked);
    assert.strictEqual(component.sessionTypes[1].title, 'Session Type 2');
    assert.ok(component.sessionTypes[1].isChecked);
    assert.strictEqual(component.sessionTypes[2].title, 'Session Type 3');
    assert.ok(component.sessionTypes[2].isChecked);
    assert.strictEqual(component.sessionTypes[3].title, 'Session Type 4');
    assert.notOk(component.sessionTypes[3].isChecked);
  });

  test('selected session types toggle remove', async function (assert) {
    this.set('remove', (id) => {
      assert.step('remove called');
      assert.strictEqual(id, 1);
    });
    await render(
      <template>
        <SessionTypesCalendarFilter
          @school={{this.school}}
          @selectedIds={{array 1}}
          @add={{(noop)}}
          @remove={{this.remove}}
        />
      </template>,
    );
    assert.ok(component.sessionTypes[0].isChecked);
    await component.sessionTypes[0].click();
    assert.verifySteps(['remove called']);
  });

  test('unselected session types toggle add', async function (assert) {
    this.set('add', (id) => {
      assert.step('add called');
      assert.strictEqual(id, 1);
    });
    await render(
      <template>
        <SessionTypesCalendarFilter @school={{this.school}} @add={{this.add}} @remove={{(noop)}} />
      </template>,
    );
    assert.notOk(component.sessionTypes[0].isChecked);
    await component.sessionTypes[0].click();
    assert.verifySteps(['add called']);
  });
});
