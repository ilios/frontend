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

  test('termsWithAllParents', async function (assert) {
    assert.expect(7);
    const store = this.owner.lookup('service:store');
    const subject = store.createRecord('session-objective');
    const term1 = store.createRecord('term');
    const term2 = store.createRecord('term', { parent: term1 });
    const term3 = store.createRecord('term', { parent: term1 });
    const term4 = store.createRecord('term', { parent: term2 });
    const term5 = store.createRecord('term', { parent: term3 });
    const term6 = store.createRecord('term');
    subject.get('terms').pushObjects([term4, term5, term6]);
    const terms = await waitForResource(subject, 'termsWithAllParents');
    assert.strictEqual(terms.length, 6);
    assert.ok(terms.includes(term1));
    assert.ok(terms.includes(term2));
    assert.ok(terms.includes(term3));
    assert.ok(terms.includes(term4));
    assert.ok(terms.includes(term5));
    assert.ok(terms.includes(term6));
  });
});
