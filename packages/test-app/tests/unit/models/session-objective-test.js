import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { waitForResource } from 'ilios-common';

module('Unit | Model | session objective', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    const store = this.owner.lookup('service:store');
    const model = store.createRecord('session-objective');
    assert.ok(model);
  });

  test('associatedVocabularies', async function (assert) {
    const store = this.owner.lookup('service:store');
    const sessionObjective = store.createRecord('session-objective');

    const vocab1 = store.createRecord('vocabulary', { title: 'Zeppelin' });
    const vocab2 = store.createRecord('vocabulary', { title: 'Aardvark' });
    store.createRecord('term', { vocabulary: vocab1, sessionObjectives: [sessionObjective] });
    store.createRecord('term', { vocabulary: vocab1, sessionObjectives: [sessionObjective] });
    store.createRecord('term', { vocabulary: vocab2, sessionObjectives: [sessionObjective] });
    const vocabularies = await waitForResource(sessionObjective, 'associatedVocabularies');
    assert.strictEqual(vocabularies.length, 2);
    assert.strictEqual(vocabularies[0], vocab2);
    assert.strictEqual(vocabularies[1], vocab1);
  });
});
