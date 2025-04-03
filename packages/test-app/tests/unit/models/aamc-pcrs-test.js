import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { singularize, pluralize } from 'ember-inflector';

module('Unit | Model | AamcPcrs', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    this.store = this.owner.lookup('service:store');
  });

  test('it exists', function (assert) {
    const model = this.store.createRecord('aamc-pcrs');
    assert.ok(!!model);
  });

  test('pluralization', function (assert) {
    assert.strictEqual(pluralize('aamc-pcrs'), 'aamc-pcrses');
    assert.strictEqual(singularize('aamc-pcrses'), 'aamc-pcrs');
  });
});
