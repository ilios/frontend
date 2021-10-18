import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { a11yAudit } from 'ember-a11y-testing/test-support';
import { component } from 'ilios-common/page-objects/components/objective-list-item-terms';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Integration | Component | objective-list-item-terms', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const course = this.server.create('course');
    const school1 = this.server.create('school');
    const school2 = this.server.create('school');
    const vocabulary1 = this.server.create('vocabulary', { school: school1 });
    const vocabulary2 = this.server.create('vocabulary', { school: school2 });
    const term1 = this.server.create('term', { vocabulary: vocabulary1 });
    const term2 = this.server.create('term', { vocabulary: vocabulary1 });
    const term3 = this.server.create('term', { vocabulary: vocabulary2 });
    const courseObjective = this.server.create('courseObjective', {
      course,
      terms: [term1, term2, term3],
    });
    this.subject = await this.owner
      .lookup('service:store')
      .find('course-objective', courseObjective.id);
    this.vocabularyModel1 = await this.owner
      .lookup('service:store')
      .find('vocabulary', vocabulary1.id);
  });

  test('it renders and is accessible when managing', async function (assert) {
    assert.expect(3);
    this.set('subject', this.subject);
    await render(hbs`<ObjectiveListItemTerms
      @subject={{this.subject}}
      @editable={{true}}
      @manage={{(noop)}}
      @isManaging={{true}}
      @save={{(noop)}}
      @isSaving={{false}}
      @cancel={{(noop)}}
    />`);
    assert.ok(component.canSave);
    assert.ok(component.canCancel);
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('it renders and is accessible when not managing', async function (assert) {
    assert.expect(6);
    this.set('subject', this.subject);
    await render(hbs`<ObjectiveListItemTerms
      @subject={{this.subject}}
      @editable={{true}}
      @manage={{(noop)}}
      @isManaging={{false}}
      @save={{(noop)}}
      @isSaving={{false}}
      @cancel={{(noop)}}
    />`);
    assert.equal(component.list.length, 2);
    assert.equal(component.list[0].title, 'Vocabulary 1 (school 0)');
    assert.equal(component.list[0].terms.length, 2);
    assert.equal(component.list[1].title, 'Vocabulary 2 (school 1)');
    assert.equal(component.list[1].terms.length, 1);
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('manage vocabulary', async function (assert) {
    assert.expect(1);
    this.set('subject', this.subject);
    this.set('manage', (vocabulary) => {
      assert.equal(vocabulary, this.vocabularyModel1);
    });
    await render(hbs`<ObjectiveListItemTerms
      @subject={{this.subject}}
      @editable={{true}}
      @manage={{this.manage}}
      @isManaging={{false}}
      @save={{(noop)}}
      @isSaving={{false}}
      @cancel={{(noop)}}
    />`);
    await component.list[0].manage();
  });

  test('manage new', async function (assert) {
    assert.expect(1);
    this.subject.set('terms', []);
    this.set('subject', this.subject);
    this.set('manage', (vocabulary) => {
      assert.equal(vocabulary, null);
    });
    await render(hbs`<ObjectiveListItemTerms
      @subject={{this.subject}}
      @editable={{true}}
      @manage={{this.manage}}
      @isManaging={{false}}
      @save={{(noop)}}
      @isSaving={{false}}
      @cancel={{(noop)}}
    />`);
    await component.manage();
  });

  test('save', async function (assert) {
    assert.expect(1);
    this.set('subject', this.subject);
    this.set('save', () => {
      assert.ok(true);
    });
    await render(hbs`<ObjectiveListItemTerms
      @subject={{this.subject}}
      @editable={{true}}
      @manage={{(noop)}}
      @isManaging={{true}}
      @save={{this.save}}
      @isSaving={{false}}
      @cancel={{(noop)}}
    />`);
    await component.save();
  });

  test('cancel', async function (assert) {
    assert.expect(1);
    this.set('subject', this.subject);
    this.set('cancel', () => {
      assert.ok(true);
    });
    await render(hbs`<ObjectiveListItemTerms
      @subject={{this.subject}}
      @editable={{true}}
      @manage={{(noop)}}
      @isManaging={{true}}
      @save={{(noop)}}
      @isSaving={{false}}
      @cancel={{this.cancel}}
    />`);
    await component.cancel();
  });
});
