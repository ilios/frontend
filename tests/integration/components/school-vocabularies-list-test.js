import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { component } from 'ilios/tests/pages/components/school-vocabularies-list';

module('Integration | Component | school vocabularies list', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  test('it renders', async function (assert) {
    const school = this.server.create('school');
    const vocabularies = this.server.createList('vocabulary', 2, { school });
    this.server.createList('term', 2, { vocabulary: vocabularies[0] });
    this.server.create('term', { vocabulary: vocabularies[1] });
    const schoolModel = await this.owner.lookup('service:store').findRecord('school', school.id);

    this.set('school', schoolModel);
    await render(
      hbs`<SchoolVocabulariesList @school={{this.school}} @manageVocabulary={{(noop)}} />`
    );
    assert.strictEqual(component.vocabularies.length, 2);
    assert.strictEqual(component.vocabularies[0].title.text, 'Vocabulary 1');
    assert.strictEqual(component.vocabularies[0].termsCount, '2');
    assert.strictEqual(component.vocabularies[1].title.text, 'Vocabulary 2');
    assert.strictEqual(component.vocabularies[1].termsCount, '1');
  });

  test('cannot delete vocabularies with terms', async function (assert) {
    const school = this.server.create('school');
    const vocabularies = this.server.createList('vocabulary', 3, { school });
    this.server.createList('term', 2, { vocabulary: vocabularies[0] });
    this.server.create('term', { vocabulary: vocabularies[1] });
    const schoolModel = await this.owner.lookup('service:store').findRecord('school', school.id);

    this.set('school', schoolModel);
    await render(hbs`<SchoolVocabulariesList
      @school={{this.school}}
      @manageVocabulary={{(noop)}}
      @canDelete={{true}}
    />`);
    assert.strictEqual(component.vocabularies.length, 3);
    assert.notOk(component.vocabularies[0].hasDeleteButton);
    assert.notOk(component.vocabularies[1].hasDeleteButton);
    assert.ok(component.vocabularies[2].hasDeleteButton);
  });

  test('clicking delete removes the vocabulary', async function (assert) {
    const school = this.server.create('school');
    this.server.create('vocabulary', { school });
    const schoolModel = await this.owner.lookup('service:store').findRecord('school', school.id);
    this.set('school', schoolModel);
    await render(hbs`<SchoolVocabulariesList
      @school={{this.school}}
      @manageVocabulary={{(noop)}}
      @canDelete={{true}}
    />`);

    assert.notOk(component.deletionConfirmation.isVisible);
    await component.vocabularies[0].delete();
    assert.ok(component.deletionConfirmation.isVisible);
    await component.deletionConfirmation.submit();
    const vocabularies = await this.owner.lookup('service:store').findAll('vocabulary');
    assert.strictEqual(vocabularies.length, 0);
  });

  test('clicking edit fires the action to manage the vocab', async function (assert) {
    assert.expect(1);
    const school = this.server.create('school');
    const vocabularies = this.server.createList('vocabulary', 2, { school });
    const schoolModel = await this.owner.lookup('service:store').findRecord('school', school.id);

    this.set('school', schoolModel);
    this.set('edit', (id) => {
      assert.strictEqual(id, vocabularies[0].id);
    });
    await render(
      hbs`<SchoolVocabulariesList @school={{this.school}} @manageVocabulary={{this.edit}} />`
    );
    await component.vocabularies[0].manage();
  });
});
