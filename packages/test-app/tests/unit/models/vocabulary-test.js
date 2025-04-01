import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { pluralize } from 'ember-inflector';

module('Unit | Model | vocabulary', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    const model = this.owner.lookup('service:store').createRecord('vocabulary');
    assert.ok(!!model);
  });

  test('pluralization', function (assert) {
    assert.strictEqual(pluralize('vocabulary'), 'vocabularies');
  });

  test('getTopLevelTerms', async function (assert) {
    const store = this.owner.lookup('service:store');
    const vocabulary = store.createRecord('vocabulary');
    const term1 = store.createRecord('term', { id: '1', vocabulary });
    const term2 = store.createRecord('term', { id: '2', vocabulary });
    store.createRecord('term', { id: '3', parent: term2, vocabulary });
    const topLevelTerms = await vocabulary.getTopLevelTerms();
    assert.strictEqual(topLevelTerms.length, 2);
    assert.ok(topLevelTerms.includes(term1));
    assert.ok(topLevelTerms.includes(term2));
  });
});
