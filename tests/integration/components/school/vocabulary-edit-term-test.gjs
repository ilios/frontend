import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { component } from 'frontend/tests/pages/components/school/vocabulary-edit-term';
import { setupMSW } from 'frontend/tests/msw';
import VocabularyEditTerm from 'frontend/components/school/vocabulary-edit-term';
import noop from 'frontend/helpers/noop';

module('Integration | Component | school/vocabulary-edit-term', function (hooks) {
  setupRenderingTest(hooks);
  setupMSW(hooks);

  test('it renders', async function (assert) {
    const school = await this.server.create('school');
    const vocabulary = await this.server.create('vocabulary', { school });
    const term = await this.server.create('term', {
      title: 'existing title',
      description: 'existing description',
      active: true,
      vocabulary,
    });
    const termModel = await this.owner.lookup('service:store').findRecord('term', term.id);

    this.set('term', termModel);
    await render(
      <template><VocabularyEditTerm @term={{this.term}} @cancel={{(noop)}} /></template>,
    );

    assert.strictEqual(component.title, 'Edit Term');
    assert.strictEqual(component.isActive.yesNoToggle.checked, 'true');
  });

  test('edit term', async function (assert) {
    const school = await this.server.create('school');
    const vocabulary = await this.server.create('vocabulary', { school });
    const term = await this.server.create('term', {
      title: 'original title',
      description: 'original description',
      active: true,
      vocabulary,
    });
    const termModel = await this.owner.lookup('service:store').findRecord('term', term.id);
    const updatedTitle = 'updated title';
    const updatedDescription = 'updated description';

    this.set('term', termModel);
    this.set('cancel', () => assert.step('cancel called'));
    await render(
      <template><VocabularyEditTerm @term={{this.term}} @cancel={{this.cancel}} /></template>,
    );

    await component.setTitle(updatedTitle);
    await component.setDescription(updatedDescription);
    await component.save();

    assert.strictEqual(termModel.title, updatedTitle);
    assert.strictEqual(termModel.description, updatedDescription);
    assert.true(termModel.active);
    assert.verifySteps(['cancel called']);
  });

  test('active reflects term active value', async function (assert) {
    const school = await this.server.create('school');
    const vocabulary = await this.server.create('vocabulary', { school });
    const term = await this.server.create('term', {
      title: 'a term',
      active: false,
      vocabulary,
    });
    const termModel = await this.owner.lookup('service:store').findRecord('term', term.id);

    this.set('term', termModel);
    await render(
      <template><VocabularyEditTerm @term={{this.term}} @cancel={{(noop)}} /></template>,
    );

    assert.strictEqual(component.isActive.yesNoToggle.checked, 'false');
  });

  test('toggle active', async function (assert) {
    const school = await this.server.create('school');
    const vocabulary = await this.server.create('vocabulary', { school });
    const term = await this.server.create('term', {
      title: 'a term',
      active: true,
      vocabulary,
    });
    const termModel = await this.owner.lookup('service:store').findRecord('term', term.id);

    this.set('term', termModel);
    this.set('cancel', () => assert.step('cancel called'));
    await render(
      <template><VocabularyEditTerm @term={{this.term}} @cancel={{this.cancel}} /></template>,
    );

    await component.isActive.yesNoToggle.handle.click();
    await component.save();

    assert.false(termModel.active);
    assert.verifySteps(['cancel called']);
  });

  test('cancel', async function (assert) {
    const school = await this.server.create('school');
    const vocabulary = await this.server.create('vocabulary', { school });
    const term = await this.server.create('term', {
      title: 'original title',
      vocabulary,
    });
    const termModel = await this.owner.lookup('service:store').findRecord('term', term.id);

    this.set('term', termModel);
    this.set('cancel', () => assert.step('cancel called'));
    await render(
      <template><VocabularyEditTerm @term={{this.term}} @cancel={{this.cancel}} /></template>,
    );

    await component.setTitle('changed title');
    await component.cancel();

    assert.strictEqual(termModel.title, 'original title');
    assert.verifySteps(['cancel called']);
  });

  test('cannot edit term with empty title', async function (assert) {
    const school = await this.server.create('school');
    const vocabulary = await this.server.create('vocabulary', { school });
    const term = await this.server.create('term', {
      title: 'a term',
      vocabulary,
    });
    const termModel = await this.owner.lookup('service:store').findRecord('term', term.id);

    this.set('term', termModel);
    await render(
      <template><VocabularyEditTerm @term={{this.term}} @cancel={{(noop)}} /></template>,
    );

    assert.notOk(component.hasError);
    await component.setTitle('');
    await component.save();
    assert.ok(component.hasError);
    assert.strictEqual(component.errorMessage, 'Term can not be blank');
  });

  test('cannot edit term with long title', async function (assert) {
    const school = await this.server.create('school');
    const vocabulary = await this.server.create('vocabulary', { school });
    const term = await this.server.create('term', {
      title: 'a term',
      vocabulary,
    });
    const termModel = await this.owner.lookup('service:store').findRecord('term', term.id);

    this.set('term', termModel);
    await render(
      <template><VocabularyEditTerm @term={{this.term}} @cancel={{(noop)}} /></template>,
    );

    assert.notOk(component.hasError);
    await component.setTitle('too long'.repeat(50));
    await component.save();
    assert.ok(component.hasError);
    assert.strictEqual(component.errorMessage, 'Term is too long (maximum is 200 characters)');
  });

  test('cannot edit term with duplicate title', async function (assert) {
    const duplicateTitle = 'Aardvark';
    const school = await this.server.create('school');
    const vocabulary = await this.server.create('vocabulary', { school });
    await this.server.create('term', {
      title: duplicateTitle,
      vocabulary,
    });
    const term = await this.server.create('term', {
      title: 'other term',
      vocabulary,
    });
    const termModel = await this.owner.lookup('service:store').findRecord('term', term.id);

    this.set('term', termModel);
    await render(
      <template><VocabularyEditTerm @term={{this.term}} @cancel={{(noop)}} /></template>,
    );

    assert.notOk(component.hasError);
    await component.setTitle(duplicateTitle);
    await component.save();
    assert.ok(component.hasError);
    assert.strictEqual(component.errorMessage, 'Term is a duplicate');
  });

  test('cannot edit sub-term with duplicate sibling title', async function (assert) {
    const duplicateTitle = 'duplicate title';
    const vocabulary = await this.server.create('vocabulary');
    const parent = await this.server.create('term', {
      vocabulary,
      active: true,
    });
    await this.server.create('term', {
      parent,
      title: duplicateTitle,
      vocabulary,
    });
    const term = await this.server.create('term', {
      parent,
      title: 'other nested term',
      vocabulary,
    });
    const termModel = await this.owner.lookup('service:store').findRecord('term', term.id);

    this.set('term', termModel);
    await render(
      <template><VocabularyEditTerm @term={{this.term}} @cancel={{(noop)}} /></template>,
    );

    assert.notOk(component.hasError);
    await component.setTitle(duplicateTitle);
    await component.save();
    assert.ok(component.hasError);
    assert.strictEqual(component.errorMessage, 'Term is a duplicate');
  });

  test('save term with no changes does not count as duplicate title', async function (assert) {
    const existingTitle = 'Term of Great Justice';
    const school = await this.server.create('school');
    const vocabulary = await this.server.create('vocabulary', { school });
    const term = await this.server.create('term', {
      title: existingTitle,
      vocabulary,
    });
    const termModel = await this.owner.lookup('service:store').findRecord('term', term.id);

    this.set('term', termModel);
    this.set('cancel', () => assert.step('cancel called'));
    await render(
      <template><VocabularyEditTerm @term={{this.term}} @cancel={{this.cancel}} /></template>,
    );

    assert.notOk(component.hasError);
    await component.save();
    assert.notOk(component.hasError);
    assert.verifySteps(['cancel called']);
  });
});
