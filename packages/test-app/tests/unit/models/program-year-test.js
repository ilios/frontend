import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { waitForResource } from 'ilios-common';

module('Unit | Model | ProgramYear', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    const model = this.owner.lookup('service:store').createRecord('program-year');
    assert.ok(!!model);
  });

  test('classOf string', async function (assert) {
    const model = this.owner.lookup('service:store').createRecord('program-year');
    const store = model.store;
    const program = store.createRecord('program', { id: '99', duration: 1 });
    model.set('program', program);
    model.set('startYear', 2000);
    assert.strictEqual(await waitForResource(model, 'classOfYear'), '2001');
    program.set('duration', 5);
    assert.strictEqual(await waitForResource(model, 'classOfYear'), '2005');
    model.set('startYear', 2001);
    assert.strictEqual(await waitForResource(model, 'classOfYear'), '2006');
  });

  test('assignableVocabularies', async function (assert) {
    const store = this.owner.lookup('service:store');
    const programYear = store.createRecord('program-year');
    const school = store.createRecord('school');
    const vocabulary1 = store.createRecord('vocabulary', {
      title: 'Sowjetunion',
      school,
    });
    const vocabulary2 = store.createRecord('vocabulary', {
      title: 'DDR',
      school,
    });
    store.createRecord('program', { school, programYears: [programYear] });

    const vocabularies = await waitForResource(programYear, 'assignableVocabularies');
    assert.strictEqual(vocabularies.length, 2);
    assert.strictEqual(vocabularies[0], vocabulary2);
    assert.strictEqual(vocabularies[1], vocabulary1);
  });

  test('associatedVocabularies', async function (assert) {
    const store = this.owner.lookup('service:store');
    const programYear = store.createRecord('program-year');
    const vocabulary1 = store.createRecord('vocabulary');
    const vocabulary2 = store.createRecord('vocabulary');
    store.createRecord('vocabulary');

    store.createRecord('term', { vocabulary: vocabulary1, programYears: [programYear] });
    store.createRecord('term', { vocabulary: vocabulary1, programYears: [programYear] });
    store.createRecord('term', { vocabulary: vocabulary1, programYears: [programYear] });
    store.createRecord('term', { vocabulary: vocabulary2, programYears: [programYear] });

    const vocabularies = await waitForResource(programYear, 'associatedVocabularies');
    assert.strictEqual(vocabularies.length, 2);
    assert.strictEqual(vocabularies[0], vocabulary1);
    assert.strictEqual(vocabularies[1], vocabulary2);
  });
});
