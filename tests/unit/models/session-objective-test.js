import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { waitForResource } from 'ilios-common';

module('Unit | Model | session objective', function (hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function (assert) {
    const store = this.owner.lookup('service:store');
    const model = store.createRecord('session-objective', {});
    assert.ok(model);
  });

  test('associatedVocabularies', async function (assert) {
    assert.expect(3);
    const store = this.owner.lookup('service:store');
    const subject = store.createRecord('session-objective');
    const vocab1 = store.createRecord('vocabulary', { title: 'Zeppelin' });
    const vocab2 = store.createRecord('vocabulary', { title: 'Aardvark' });
    const term1 = store.createRecord('term', { vocabulary: vocab1 });
    const term2 = store.createRecord('term', { vocabulary: vocab1 });
    const term3 = store.createRecord('term', { vocabulary: vocab2 });
    subject.get('terms').pushObjects([term1, term2, term3]);
    const vocabularies = await waitForResource(subject, 'associatedVocabularies');
    assert.strictEqual(vocabularies.length, 2);
    assert.strictEqual(vocabularies[0], vocab2);
    assert.strictEqual(vocabularies[1], vocab1);
  });
});
