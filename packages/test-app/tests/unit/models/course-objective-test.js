import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { waitForResource } from 'ilios-common';

module('Unit | Model | course objective', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    const store = this.owner.lookup('service:store');
    const model = store.createRecord('course-objective', {});
    assert.ok(model);
  });

  test('associatedVocabularies', async function (assert) {
    const store = this.owner.lookup('service:store');
    const subject = store.createRecord('course-objective');
    const vocab1 = store.createRecord('vocabulary', { title: 'Zeppelin' });
    const vocab2 = store.createRecord('vocabulary', { title: 'Aardvark' });
    const term1 = store.createRecord('term', { vocabulary: vocab1 });
    const term2 = store.createRecord('term', { vocabulary: vocab1 });
    const term3 = store.createRecord('term', { vocabulary: vocab2 });
    (await subject.terms).push(term1, term2, term3);
    const vocabularies = await waitForResource(subject, 'associatedVocabularies');
    assert.strictEqual(vocabularies.length, 2);
    assert.strictEqual(vocabularies[0], vocab2);
    assert.strictEqual(vocabularies[1], vocab1);

    const vocab3 = store.createRecord('vocabulary', { title: 'New(ish)' });
    const term4 = store.createRecord('term', { vocabulary: vocab3 });
    (await subject.terms).push(term4);
    const vocabulariesAgain = await waitForResource(subject, 'associatedVocabularies');
    assert.strictEqual(vocabulariesAgain.length, 3);
    assert.strictEqual(vocabulariesAgain[0], vocab2);
    assert.strictEqual(vocabulariesAgain[1], vocab3);
    assert.strictEqual(vocabulariesAgain[2], vocab1);
  });

  test('treeCompetencies', async function (assert) {
    const store = this.owner.lookup('service:store');
    const subject = store.createRecord('course-objective');
    const competency1 = store.createRecord('competency');
    const competency2 = store.createRecord('competency');
    const programYearObjective1 = store.createRecord('program-year-objective', {
      competency: competency1,
    });
    const programYearObjective2 = store.createRecord('program-year-objective', {
      competency: competency2,
    });
    (await subject.programYearObjectives).push(programYearObjective1, programYearObjective2);
    const treeCompetencies = await waitForResource(subject, 'treeCompetencies');
    assert.strictEqual(treeCompetencies.length, 2);
    assert.ok(treeCompetencies.includes(competency1));
    assert.ok(treeCompetencies.includes(competency2));
  });
});
