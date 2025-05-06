import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { a11yAudit } from 'ember-a11y-testing/test-support';
import { component } from 'ilios-common/page-objects/components/objective-list-item-terms';
import { setupMirage } from 'test-app/tests/test-support/mirage';
import ObjectiveListItemTerms from 'ilios-common/components/objective-list-item-terms';
import noop from 'ilios-common/helpers/noop';

module('Integration | Component | objective-list-item-terms', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    this.course = this.server.create('course');
    const school1 = this.server.create('school');
    const school2 = this.server.create('school');
    const vocabulary1 = this.server.create('vocabulary', { school: school1 });
    const vocabulary2 = this.server.create('vocabulary', { school: school2 });
    const term1 = this.server.create('term', { vocabulary: vocabulary1 });
    const term2 = this.server.create('term', { vocabulary: vocabulary1 });
    const term3 = this.server.create('term', { vocabulary: vocabulary2 });
    const courseObjective = this.server.create('course-objective', {
      course: this.course,
      terms: [term1, term2, term3],
    });
    const store = this.owner.lookup('service:store');
    this.subject = await store.findRecord('course-objective', courseObjective.id);
    this.vocabularyModel1 = await store.findRecord('vocabulary', vocabulary1.id);
  });

  test('it renders and is accessible when managing', async function (assert) {
    this.set('subject', this.subject);
    await render(
      <template>
        <ObjectiveListItemTerms
          @subject={{this.subject}}
          @editable={{true}}
          @manage={{(noop)}}
          @isManaging={{true}}
          @save={{(noop)}}
          @isSaving={{false}}
          @cancel={{(noop)}}
        />
      </template>,
    );
    assert.ok(component.canSave);
    assert.ok(component.canCancel);
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('it renders and is accessible when not managing', async function (assert) {
    this.set('subject', this.subject);
    await render(
      <template>
        <ObjectiveListItemTerms
          @subject={{this.subject}}
          @editable={{true}}
          @manage={{(noop)}}
          @isManaging={{false}}
          @save={{(noop)}}
          @isSaving={{false}}
          @cancel={{(noop)}}
        />
      </template>,
    );
    assert.strictEqual(component.list.length, 2);
    assert.strictEqual(component.list[0].title, 'Vocabulary 1 (school 0)');
    assert.strictEqual(component.list[0].terms.length, 2);
    assert.strictEqual(component.list[1].title, 'Vocabulary 2 (school 1)');
    assert.strictEqual(component.list[1].terms.length, 1);
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('manage vocabulary', async function (assert) {
    assert.expect(1);
    this.set('subject', this.subject);
    this.set('manage', (vocabulary) => {
      assert.strictEqual(vocabulary, this.vocabularyModel1);
    });
    await render(
      <template>
        <ObjectiveListItemTerms
          @subject={{this.subject}}
          @editable={{true}}
          @manage={{this.manage}}
          @isManaging={{false}}
          @save={{(noop)}}
          @isSaving={{false}}
          @cancel={{(noop)}}
        />
      </template>,
    );
    await component.list[0].manage();
  });

  test('manage new', async function (assert) {
    assert.expect(1);
    const courseObjective = this.server.create('course-objective', {
      course: this.course,
    });
    const subject = await this.owner
      .lookup('service:store')
      .findRecord('course-objective', courseObjective.id);
    this.set('subject', subject);
    this.set('manage', (vocabulary) => {
      assert.strictEqual(vocabulary, null);
    });
    await render(
      <template>
        <ObjectiveListItemTerms
          @subject={{this.subject}}
          @editable={{true}}
          @manage={{this.manage}}
          @isManaging={{false}}
          @save={{(noop)}}
          @isSaving={{false}}
          @cancel={{(noop)}}
        />
      </template>,
    );
    await component.manage();
  });

  test('save', async function (assert) {
    assert.expect(1);
    this.set('subject', this.subject);
    this.set('save', () => {
      assert.ok(true);
    });
    await render(
      <template>
        <ObjectiveListItemTerms
          @subject={{this.subject}}
          @editable={{true}}
          @manage={{(noop)}}
          @isManaging={{true}}
          @save={{this.save}}
          @isSaving={{false}}
          @cancel={{(noop)}}
        />
      </template>,
    );
    await component.save();
  });

  test('cancel', async function (assert) {
    assert.expect(1);
    this.set('subject', this.subject);
    this.set('cancel', () => {
      assert.ok(true);
    });
    await render(
      <template>
        <ObjectiveListItemTerms
          @subject={{this.subject}}
          @editable={{true}}
          @manage={{(noop)}}
          @isManaging={{true}}
          @save={{(noop)}}
          @isSaving={{false}}
          @cancel={{this.cancel}}
        />
      </template>,
    );
    await component.cancel();
  });
});
