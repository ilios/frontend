import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { waitForResource } from 'ilios-common';

module('Unit | Model | ProgramYear', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    this.store = this.owner.lookup('service:store');
  });

  test('it exists', function (assert) {
    const model = this.store.createRecord('program-year');
    assert.ok(!!model);
  });

  test('classOf string', async function (assert) {
    const model = this.store.createRecord('program-year');
    const program = this.store.createRecord('program', { duration: 1 });
    model.set('program', program);
    model.set('startYear', 2000);
    assert.strictEqual(await waitForResource(model, 'classOfYear'), '2001');
    program.set('duration', 5);
    assert.strictEqual(await waitForResource(model, 'classOfYear'), '2005');
    model.set('startYear', 2001);
    assert.strictEqual(await waitForResource(model, 'classOfYear'), '2006');
  });

  test('assignableVocabularies', async function (assert) {
    const programYear = this.store.createRecord('program-year');
    const school = this.store.createRecord('school');
    const vocabulary1 = this.store.createRecord('vocabulary', {
      title: 'Sowjetunion',
      school,
    });
    const vocabulary2 = this.store.createRecord('vocabulary', {
      title: 'DDR',
      school,
    });
    this.store.createRecord('program', { school, programYears: [programYear] });

    const vocabularies = await waitForResource(programYear, 'assignableVocabularies');
    assert.strictEqual(vocabularies.length, 2);
    assert.strictEqual(vocabularies[0], vocabulary2);
    assert.strictEqual(vocabularies[1], vocabulary1);
  });

  test('associatedVocabularies', async function (assert) {
    const programYear = this.store.createRecord('program-year');
    const vocabulary1 = this.store.createRecord('vocabulary');
    const vocabulary2 = this.store.createRecord('vocabulary');
    this.store.createRecord('vocabulary');

    this.store.createRecord('term', { vocabulary: vocabulary1, programYears: [programYear] });
    this.store.createRecord('term', { vocabulary: vocabulary1, programYears: [programYear] });
    this.store.createRecord('term', { vocabulary: vocabulary1, programYears: [programYear] });
    this.store.createRecord('term', { vocabulary: vocabulary2, programYears: [programYear] });

    const vocabularies = await waitForResource(programYear, 'associatedVocabularies');
    assert.strictEqual(vocabularies.length, 2);
    assert.strictEqual(vocabularies[0], vocabulary1);
    assert.strictEqual(vocabularies[1], vocabulary2);
  });
});
