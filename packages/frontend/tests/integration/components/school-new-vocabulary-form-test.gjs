import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { component } from 'frontend/tests/pages/components/school-new-vocabulary-form';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import SchoolNewVocabularyForm from 'frontend/components/school-new-vocabulary-form';
import noop from 'ilios-common/helpers/noop';

module('Integration | Component | school-new-vocabulary-form', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const school = this.server.create('school');
    this.server.create('vocabulary', { school, title: 'Vocab A' });
    this.schoolModel = await this.owner.lookup('service:store').findRecord('school', school.id);
  });

  test('it renders', async function (assert) {
    this.set('school', this.schoolModel);
    await render(
      <template><SchoolNewVocabularyForm @school={{this.school}} @close={{(noop)}} /></template>,
    );
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
    assert.strictEqual(component.title.label, 'Title:');
    assert.strictEqual(component.title.value, '');
    assert.strictEqual(component.submit.text, 'Done');
    assert.strictEqual(component.cancel.text, 'Cancel');
  });

  test('validation fails if title is blank', async function (assert) {
    this.set('school', this.schoolModel);
    await render(
      <template><SchoolNewVocabularyForm @school={{this.school}} @close={{(noop)}} /></template>,
    );
    assert.notOk(component.title.hasError);
    await component.title.set('');
    await component.submit.click();
    assert.ok(component.title.hasError);
  });

  test('validation fails if title is too long', async function (assert) {
    this.set('school', this.schoolModel);
    await render(
      <template><SchoolNewVocabularyForm @school={{this.school}} @close={{(noop)}} /></template>,
    );
    assert.notOk(component.title.hasError);
    await component.title.set('0123456789'.repeat(21));
    await component.submit.click();
    assert.ok(component.title.hasError);
  });

  test('validation fails if title is not unique', async function (assert) {
    this.set('school', this.schoolModel);
    const vocabularies = await this.schoolModel.vocabularies;
    await render(
      <template><SchoolNewVocabularyForm @school={{this.school}} @close={{(noop)}} /></template>,
    );
    assert.notOk(component.title.hasError);
    assert.expect(vocabularies[0].title, 'Vocab A');
    await component.title.set(vocabularies[0].title);
    await component.submit.click();
    assert.ok(component.title.hasError);
  });

  test('close', async function (assert) {
    assert.expect(1);
    this.set('school', this.schoolModel);
    this.set('close', () => {
      assert.ok(true, 'close action fires.');
    });
    await render(
      <template>
        <SchoolNewVocabularyForm @school={{this.school}} @close={{this.close}} />
      </template>,
    );
    await component.cancel.click();
  });

  test('save', async function (assert) {
    assert.expect(3);
    const newTitle = 'New Vocabulary';
    this.set('school', this.schoolModel);
    this.set('save', {
      linked() {
        return {
          perform: (title, school, active) => {
            assert.strictEqual(title, newTitle);
            assert.strictEqual(parseInt(school.id, 10), 1);
            assert.true(active);
          },
        };
      },
    });
    await render(
      <template>
        <SchoolNewVocabularyForm @school={{this.school}} @close={{(noop)}} @save={{this.save}} />
      </template>,
    );
    await component.title.set(newTitle);
    await component.submit.click();
  });
});
