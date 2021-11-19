import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { waitForResource } from 'ilios-common';

module('Unit | Model | SessionType', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    this.store = this.owner.lookup('service:store');
  });

  test('it exists', function (assert) {
    const model = this.store.createRecord('session-type');
    assert.ok(!!model);
  });

  test('safeCalendarColor', function (assert) {
    const model = this.store.createRecord('session-type');
    assert.strictEqual(model.safeCalendarColor, '');
    model.set('calendarColor', '#ffffff');
    assert.strictEqual(model.safeCalendarColor.string, '#ffffff');
  });

  test('sessionCount', async function (assert) {
    const model = this.store.createRecord('session-type');
    let sessionCount = await waitForResource(model, 'sessionCount');
    assert.strictEqual(sessionCount, 0);
    const session = this.store.createRecord('session', { sessionType: model });
    sessionCount = await waitForResource(model, 'sessionCount');
    assert.strictEqual(sessionCount, 1);
    session.set('sessionType', null);
    sessionCount = await waitForResource(model, 'sessionCount');
    assert.strictEqual(sessionCount, 0);
  });

  test('firstAamcMethod', async function (assert) {
    const model = this.store.createRecord('session-type');
    let firstAamcMethod = await waitForResource(model, 'firstAamcMethod');
    assert.strictEqual(firstAamcMethod, undefined);
    const aamcMethod1 = this.store.createRecord('aamc-method', { sessionTypes: [model] });
    firstAamcMethod = await waitForResource(model, 'firstAamcMethod');
    assert.strictEqual(firstAamcMethod, aamcMethod1);
    const aamcMethod2 = this.store.createRecord('aamc-method', { sessionTypes: [model] });
    firstAamcMethod = await waitForResource(model, 'firstAamcMethod');
    assert.strictEqual(firstAamcMethod, aamcMethod1);
    model.aamcMethods.removeObject(aamcMethod1);
    firstAamcMethod = await waitForResource(model, 'firstAamcMethod');
    assert.strictEqual(firstAamcMethod, aamcMethod2);
  });
});
