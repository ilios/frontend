import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, findAll, find, fillIn } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { run } from '@ember/runloop';

module('Integration | Component | school vocabularies list', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function(assert) {
    assert.expect(4);
    const school = this.server.create('school');
    const vocabularies = this.server.createList('vocabulary', 2, { school });
    this.server.createList('term', 2, { vocabulary: vocabularies[0] });
    this.server.create('term', { vocabulary: vocabularies[1] });
    const schoolModel = await run(() => this.owner.lookup('service:store').find('school', school.id));

    this.set('edit', () => {});
    this.set('school', schoolModel);
    await render(hbs`{{school-vocabularies-list school=school manageVocabulary=(action edit)}}`);
    assert.equal(find('[data-test-vocabulary="0"] td:nth-of-type(1)').textContent.trim(), 'Vocabulary 1');
    assert.equal(find('[data-test-vocabulary="1"] td:nth-of-type(1)').textContent.trim(), 'Vocabulary 2');
    assert.equal(find('[data-test-vocabulary="0"] td:nth-of-type(2)').textContent.trim(), '2');
    assert.equal(find('[data-test-vocabulary="1"] td:nth-of-type(2)').textContent.trim(), '1');
  });

  test('can create new vocabulary', async function(assert) {
    assert.expect(4);
    this.server.create('school');
    const school = await run(() => this.owner.lookup('service:store').find('school', 1));

    this.set('edit', () => {});
    this.set('school', school);
    await render(hbs`{{school-vocabularies-list school=school manageVocabulary=(action edit) canCreate=true}}`);
    await click('.expand-button');
    await fillIn('input', 'new vocab');
    await click('.done');
    assert.equal(find('.savedvocabulary').textContent.trim().search(/new vocab/), 0);

    const vocabularies = await run(() => this.owner.lookup('service:store').findAll('vocabulary'));
    assert.equal(vocabularies.length, 1);
    assert.equal(vocabularies.objectAt(0).title, 'new vocab');
    const vocabSchool = await vocabularies.objectAt(0).school;
    assert.deepEqual(vocabSchool, school);
  });

  test('cannot delete vocabularies with terms', async function(assert) {
    assert.expect(3);
    const school = this.server.create('school');
    const vocabularies = this.server.createList('vocabulary', 3, { school });
    this.server.createList('term', 2, { vocabulary: vocabularies[0] });
    this.server.create('term', { vocabulary: vocabularies[1] });
    const schoolModel = await run(() => this.owner.lookup('service:store').find('school', school.id));

    this.set('edit', () => {});
    this.set('school', schoolModel);
    await render(hbs`{{school-vocabularies-list school=school manageVocabulary=(action edit) canDelete=true}}`);
    assert.equal(findAll('[data-test-vocabulary="0"] td:nth-of-type(3) svg').length, 1);
    assert.equal(findAll('[data-test-vocabulary="1"] td:nth-of-type(3) svg').length, 1);
    assert.equal(findAll('[data-test-vocabulary="2"] td:nth-of-type(3) svg').length, 2);

  });

  test('clicking delete removes the vocabulary', async function(assert) {
    assert.expect(5);
    const school = this.server.create('school');
    this.server.create('vocabulary', { school });
    const schoolModel = await run(() => this.owner.lookup('service:store').find('school', school.id));
    this.set('edit', () => {});
    this.set('school', schoolModel);
    await render(hbs`{{school-vocabularies-list school=school manageVocabulary=(action edit) canDelete=true}}`);

    assert.notOk(find('[data-test-vocabulary="0"]').classList.contains('confirm-removal'));
    assert.equal(findAll('[data-test-vocabulary="0"] td:nth-of-type(3) .remove').length, 1);
    await click('[data-test-vocabulary="0"] td:nth-of-type(3) .remove');
    assert.equal(find(findAll('tr')[2]).textContent.trim().search(/Are you sure you want to delete this vocabulary/), 0);
    assert.ok(find('[data-test-vocabulary="0"]').classList.contains('confirm-removal'));
    await click('[data-test-confirm-removal="0"] .remove');
    const vocabularies = await run(() => this.owner.lookup('service:store').findAll('vocabulary'));
    assert.equal(vocabularies.length, 0);

  });

  test('clicking edit fires the action to manage the vocab', async function(assert) {
    assert.expect(1);
    const school = this.server.create('school');
    const vocabularies = this.server.createList('vocabulary', 2, { school });
    const schoolModel = await run(() => this.owner.lookup('service:store').find('school', school.id));

    this.set('school', schoolModel);
    this.set('edit', function(id){
      assert.equal(id, vocabularies[0].id);
    });
    await render(hbs`{{school-vocabularies-list school=school manageVocabulary=(action edit)}}`);
    await click('[data-test-vocabulary="0"] svg');
  });
});
