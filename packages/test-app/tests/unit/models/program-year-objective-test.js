import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { waitForResource } from 'ilios-common';

module('Unit | Model | program year objective', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    this.store = this.owner.lookup('service:store');
  });

  test('it exists', function (assert) {
    const model = this.store.createRecord('program-year-objective');
    assert.ok(model);
  });

  test('associatedVocabularies', async function (assert) {
    const programYearObjective = this.store.createRecord('program-year-objective');

    const vocab1 = this.store.createRecord('vocabulary', { title: 'Zeppelin' });
    const vocab2 = this.store.createRecord('vocabulary', { title: 'Aardvark' });
    this.store.createRecord('term', {
      vocabulary: vocab1,
      programYearObjectives: [programYearObjective],
    });
    this.store.createRecord('term', {
      vocabulary: vocab1,
      programYearObjectives: [programYearObjective],
    });
    this.store.createRecord('term', {
      vocabulary: vocab2,
      programYearObjectives: [programYearObjective],
    });
    const vocabularies = await waitForResource(programYearObjective, 'associatedVocabularies');
    assert.strictEqual(vocabularies.length, 2);
    assert.strictEqual(vocabularies[0], vocab2);
    assert.strictEqual(vocabularies[1], vocab1);
  });
});
