import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { waitForResource } from 'ilios-common';

module('Unit | Model | session objective', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    this.store = this.owner.lookup('service:store');
  });

  test('it exists', function (assert) {
    const model = this.store.createRecord('session-objective');
    assert.ok(model);
  });

  test('associatedVocabularies', async function (assert) {
    const sessionObjective = this.store.createRecord('session-objective');

    const vocab1 = this.store.createRecord('vocabulary', { title: 'Zeppelin' });
    const vocab2 = this.store.createRecord('vocabulary', { title: 'Aardvark' });
    this.store.createRecord('term', { vocabulary: vocab1, sessionObjectives: [sessionObjective] });
    this.store.createRecord('term', { vocabulary: vocab1, sessionObjectives: [sessionObjective] });
    this.store.createRecord('term', { vocabulary: vocab2, sessionObjectives: [sessionObjective] });
    const vocabularies = await waitForResource(sessionObjective, 'associatedVocabularies');
    assert.strictEqual(vocabularies.length, 2);
    assert.strictEqual(vocabularies[0], vocab2);
    assert.strictEqual(vocabularies[1], vocab1);
  });
});
