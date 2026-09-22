import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { pluralize } from 'ember-inflector';

module('Unit | Model | vocabulary', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    this.store = this.owner.lookup('service:store');
  });

  test('it exists', function (assert) {
    const model = this.store.createRecord('vocabulary');
    assert.ok(!!model);
  });

  test('pluralization', function (assert) {
    assert.strictEqual(pluralize('vocabulary'), 'vocabularies');
  });

  test('getTopLevelTerms', async function (assert) {
    const vocabulary = this.store.createRecord('vocabulary');
    const term1 = this.store.createRecord('term', { vocabulary });
    const term2 = this.store.createRecord('term', { vocabulary });
    this.store.createRecord('term', { parent: term2, vocabulary });
    const topLevelTerms = await vocabulary.getTopLevelTerms();
    assert.strictEqual(topLevelTerms.length, 2);
    assert.ok(topLevelTerms.includes(term1));
    assert.ok(topLevelTerms.includes(term2));
  });
});
