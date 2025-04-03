import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { waitForResource } from 'ilios-common';

module('Unit | Model | course objective', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    this.store = this.owner.lookup('service:store');
  });

  test('it exists', function (assert) {
    const model = this.store.createRecord('course-objective');
    assert.ok(model);
  });

  test('associatedVocabularies', async function (assert) {
    const courseObjective = this.store.createRecord('course-objective');

    const vocab1 = this.store.createRecord('vocabulary', { title: 'Zeppelin' });
    const vocab2 = this.store.createRecord('vocabulary', { title: 'Aardvark' });
    this.store.createRecord('term', { vocabulary: vocab1, courseObjectives: [courseObjective] });
    this.store.createRecord('term', { vocabulary: vocab1, courseObjectives: [courseObjective] });
    this.store.createRecord('term', { vocabulary: vocab2, courseObjectives: [courseObjective] });

    const vocabularies = await waitForResource(courseObjective, 'associatedVocabularies');
    assert.strictEqual(vocabularies.length, 2);
    assert.strictEqual(vocabularies[0], vocab2);
    assert.strictEqual(vocabularies[1], vocab1);

    const vocab3 = this.store.createRecord('vocabulary', { title: 'New(ish)' });
    this.store.createRecord('term', { vocabulary: vocab3, courseObjectives: [courseObjective] });

    const vocabulariesAgain = await waitForResource(courseObjective, 'associatedVocabularies');
    assert.strictEqual(vocabulariesAgain.length, 3);
    assert.strictEqual(vocabulariesAgain[0], vocab2);
    assert.strictEqual(vocabulariesAgain[1], vocab3);
    assert.strictEqual(vocabulariesAgain[2], vocab1);
  });

  test('treeCompetencies', async function (assert) {
    const courseObjective = this.store.createRecord('course-objective');

    const competency1 = this.store.createRecord('competency');
    const competency2 = this.store.createRecord('competency');
    this.store.createRecord('program-year-objective', {
      competency: competency1,
      courseObjectives: [courseObjective],
    });
    this.store.createRecord('program-year-objective', {
      competency: competency2,
      courseObjectives: [courseObjective],
    });
    const treeCompetencies = await waitForResource(courseObjective, 'treeCompetencies');
    assert.strictEqual(treeCompetencies.length, 2);
    assert.ok(treeCompetencies.includes(competency1));
    assert.ok(treeCompetencies.includes(competency2));
  });
});
