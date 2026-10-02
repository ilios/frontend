import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { component } from 'frontend/tests/pages/components/school/vocabulary-new-term';
import { setupMSW } from 'frontend/tests/msw';
import VocabularyNewTerm from 'frontend/components/school/vocabulary-new-term';
import noop from 'frontend/helpers/noop';

module('Integration | Component | school/vocabulary-new-term', function (hooks) {
  setupRenderingTest(hooks);
  setupMSW(hooks);

  test('it renders', async function (assert) {
    const school = await this.server.create('school');
    const vocabulary = await this.server.create('vocabulary', { school });
    const vocabularyModel = await this.owner
      .lookup('service:store')
      .findRecord('vocabulary', vocabulary.id);
    const newTitle = 'new term';
    const newDescription = 'a description';

    this.set('vocabulary', vocabularyModel);
    this.set('createTerm', (title, description, isActive) => {
      assert.step('createTerm called');
      assert.strictEqual(title, newTitle);
      assert.strictEqual(description, newDescription);
      assert.true(isActive);
    });
    await render(
      <template>
        <VocabularyNewTerm
          @vocabulary={{this.vocabulary}}
          @createTerm={{this.createTerm}}
          @cancel={{(noop)}}
        />
      </template>,
    );

    assert.strictEqual(component.header, 'New Term');
    assert.strictEqual(component.isActive.yesNoToggle.checked, 'true');
  });

  test('add term', async function (assert) {
    const school = await this.server.create('school');
    const vocabulary = await this.server.create('vocabulary', { school });
    const vocabularyModel = await this.owner
      .lookup('service:store')
      .findRecord('vocabulary', vocabulary.id);
    const newTitle = 'new term';
    const newDescription = 'a description';

    this.set('vocabulary', vocabularyModel);
    this.set('createTerm', (title, description, isActive) => {
      assert.step('createTerm called');
      assert.strictEqual(title, newTitle);
      assert.strictEqual(description, newDescription);
      assert.true(isActive);
    });
    await render(
      <template>
        <VocabularyNewTerm
          @vocabulary={{this.vocabulary}}
          @createTerm={{this.createTerm}}
          @cancel={{(noop)}}
        />
      </template>,
    );

    await component.setTitle(newTitle);
    await component.setDescription(newDescription);
    await component.save();
    assert.verifySteps(['createTerm called']);
  });

  test('active defaults to true', async function (assert) {
    const school = await this.server.create('school');
    const vocabulary = await this.server.create('vocabulary', { school });
    const vocabularyModel = await this.owner
      .lookup('service:store')
      .findRecord('vocabulary', vocabulary.id);

    this.set('vocabulary', vocabularyModel);
    await render(
      <template>
        <VocabularyNewTerm
          @vocabulary={{this.vocabulary}}
          @createTerm={{(noop)}}
          @cancel={{(noop)}}
        />
      </template>,
    );

    assert.strictEqual(component.isActive.yesNoToggle.checked, 'true');
  });

  test('toggle active', async function (assert) {
    const school = await this.server.create('school');
    const vocabulary = await this.server.create('vocabulary', { school });
    const vocabularyModel = await this.owner
      .lookup('service:store')
      .findRecord('vocabulary', vocabulary.id);
    const newTitle = 'new term';

    this.set('vocabulary', vocabularyModel);
    this.set('createTerm', (title, description, isActive) => {
      assert.step('createTerm called');
      assert.false(isActive);
    });
    await render(
      <template>
        <VocabularyNewTerm
          @vocabulary={{this.vocabulary}}
          @createTerm={{this.createTerm}}
          @cancel={{(noop)}}
        />
      </template>,
    );

    await component.isActive.yesNoToggle.handle.click();
    await component.setTitle(newTitle);
    await component.save();
    assert.verifySteps(['createTerm called']);
  });

  test('cannot add term with empty title', async function (assert) {
    const school = await this.server.create('school');
    const vocabulary = await this.server.create('vocabulary', { school });
    const vocabularyModel = await this.owner
      .lookup('service:store')
      .findRecord('vocabulary', vocabulary.id);

    this.set('vocabulary', vocabularyModel);
    await render(
      <template>
        <VocabularyNewTerm
          @vocabulary={{this.vocabulary}}
          @createTerm={{true}}
          @cancel={{(noop)}}
        />
      </template>,
    );

    assert.notOk(component.hasError);
    await component.setTitle('');
    await component.save();
    assert.ok(component.hasError);
    assert.strictEqual(component.errorMessage, 'Term can not be blank');
  });

  test('cannot add term with long title', async function (assert) {
    const school = await this.server.create('school');
    const vocabulary = await this.server.create('vocabulary', { school });
    const vocabularyModel = await this.owner
      .lookup('service:store')
      .findRecord('vocabulary', vocabulary.id);

    this.set('vocabulary', vocabularyModel);
    await render(
      <template>
        <VocabularyNewTerm
          @vocabulary={{this.vocabulary}}
          @createTerm={{true}}
          @cancel={{(noop)}}
        />
      </template>,
    );

    assert.notOk(component.hasError);
    await component.setTitle('too long'.repeat(50));
    await component.save();
    assert.ok(component.hasError);
    assert.strictEqual(component.errorMessage, 'Term is too long (maximum is 200 characters)');
  });

  test('cannot add top-level term with duplicate title', async function (assert) {
    const title = 'Aardvark';
    const school = await this.server.create('school');
    const vocabulary = await this.server.create('vocabulary', { school });
    await this.server.create('term', {
      title,
      vocabulary,
    });
    const vocabularyModel = await this.owner
      .lookup('service:store')
      .findRecord('vocabulary', vocabulary.id);

    this.set('vocabulary', vocabularyModel);
    await render(
      <template>
        <VocabularyNewTerm
          @vocabulary={{this.vocabulary}}
          @createTerm={{(noop)}}
          @cancel={{(noop)}}
        />
      </template>,
    );

    assert.notOk(component.hasError);
    await component.setTitle(title);
    await component.save();
    assert.ok(component.hasError);
    assert.strictEqual(component.errorMessage, 'Term is a duplicate');
  });

  test('cannot add nested term with duplicate title', async function (assert) {
    const title = 'duplicate title';
    const vocabulary = await this.server.create('vocabulary');
    const term = await this.server.create('term', {
      vocabulary,
      active: true,
    });
    await this.server.create('term', {
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
    await render(
      <template>
        <VocabularyNewTerm
          @vocabulary={{this.vocabulary}}
          @term={{this.term}}
          @createTerm={{(noop)}}
          @cancel={{(noop)}}
        />
      </template>,
    );

    assert.notOk(component.hasError);
    await component.setTitle(title);
    await component.save();
    assert.ok(component.hasError);
    assert.strictEqual(component.errorMessage, 'Term is a duplicate');
  });
});
