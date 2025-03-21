import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { component } from 'frontend/tests/pages/components/school-vocabulary-new-term';
import { setupMirage } from 'frontend/tests/test-support/mirage';

module('Integration | Component | school vocabulary new term', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('add term', async function (assert) {
    assert.expect(1);

    const school = this.server.create('school');
    const vocabulary = this.server.create('vocabulary', { school });
    const vocabularyModel = await this.owner
      .lookup('service:store')
      .findRecord('vocabulary', vocabulary.id);
    const newTitle = 'new term';

    this.set('vocabulary', vocabularyModel);
    this.set('createTerm', (title) => {
      assert.strictEqual(newTitle, title);
    });
    await render(
      hbs`<SchoolVocabularyNewTerm @vocabulary={{this.vocabulary}} @createTerm={{this.createTerm}} />`,
    );

    await component.setTitle(newTitle);
    await component.save();
  });

  test("can't add term with empty title", async function (assert) {
    const school = this.server.create('school');
    const vocabulary = this.server.create('vocabulary', { school });
    const vocabularyModel = await this.owner
      .lookup('service:store')
      .findRecord('vocabulary', vocabulary.id);

    this.set('vocabulary', vocabularyModel);
    await render(
      hbs`<SchoolVocabularyNewTerm @vocabulary={{this.vocabulary}} @createTerm={{true}} />`,
    );

    assert.notOk(component.hasError);
    await component.setTitle('');
    await component.save();
    assert.ok(component.hasError);
    assert.strictEqual(component.errorMessage, 'Term can not be blank');
  });

  test("can't add term with long title", async function (assert) {
    const school = this.server.create('school');
    const vocabulary = this.server.create('vocabulary', { school });
    const vocabularyModel = await this.owner
      .lookup('service:store')
      .findRecord('vocabulary', vocabulary.id);

    this.set('vocabulary', vocabularyModel);
    await render(
      hbs`<SchoolVocabularyNewTerm @vocabulary={{this.vocabulary}} @createTerm={{true}} />`,
    );

    assert.notOk(component.hasError);
    await component.setTitle('too long'.repeat(50));
    await component.save();
    assert.ok(component.hasError);
    assert.strictEqual(component.errorMessage, 'Term is too long (maximum is 200 characters)');
  });

  test("can't add top-level term with duplicate title", async function (assert) {
    const title = 'Aardvark';
    const school = this.server.create('school');
    const vocabulary = this.server.create('vocabulary', { school });
    this.server.create('term', {
      title,
      vocabulary,
    });
    const vocabularyModel = await this.owner
      .lookup('service:store')
      .findRecord('vocabulary', vocabulary.id);

    this.set('vocabulary', vocabularyModel);
    await render(
      hbs`<SchoolVocabularyNewTerm @vocabulary={{this.vocabulary}} @createTerm={{(noop)}} />`,
    );

    assert.notOk(component.hasError);
    await component.setTitle(title);
    await component.save();
    assert.ok(component.hasError);
    assert.strictEqual(component.errorMessage, 'Term is a duplicate');
  });

  test("can't add nested term with duplicate title", async function (assert) {
    const title = 'duplicate title';
    const vocabulary = this.server.create('vocabulary');
    const term = this.server.create('term', {
      vocabulary,
      active: true,
    });
    this.server.create('term', {
      parent: term,
      title,
      vocabulary,
    });
    const vocabularyModel = await this.owner
      .lookup('service:store')
      .findRecord('vocabulary', vocabulary.id);
    const termModel = await this.owner.lookup('service:store').findRecord('term', term.id);

    this.set('vocabulary', vocabularyModel);
    this.set('term', termModel);
    await render(hbs`<SchoolVocabularyNewTerm
  @vocabulary={{this.vocabulary}}
  @term={{this.term}}
  @createTerm={{(noop)}}
/>`);

    assert.notOk(component.hasError);
    await component.setTitle(title);
    await component.save();
    assert.ok(component.hasError);
    assert.strictEqual(component.errorMessage, 'Term is a duplicate');
  });
});
