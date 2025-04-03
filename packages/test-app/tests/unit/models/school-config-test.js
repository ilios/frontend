import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | School Config', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    this.store = this.owner.lookup('service:store');
  });

  test('it exists', function (assert) {
    const model = this.store.createRecord('school-config');
    assert.ok(!!model);
  });

  test('getParsedValue boolean false', async function (assert) {
    const model = this.store.createRecord('school-config', {
      name: 'test-false',
      value: 'false',
    });
    assert.false(model.parsedValue);
  });

  test('getParsedValue boolean true', async function (assert) {
    const model = this.store.createRecord('school-config', {
      name: 'test-true',
      value: 'true',
    });
    assert.true(model.parsedValue);
  });
});
