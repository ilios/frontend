import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import { component } from 'frontend/tests/pages/components/school-vocabularies-collapsed';
import SchoolVocabulariesCollapsed from 'frontend/components/school-vocabularies-collapsed';
import noop from 'ilios-common/helpers/noop';

module('Integration | Component | school vocabularies collapsed', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function (assert) {
    const school = this.server.create('school');
    const vocabulary1 = this.server.create('vocabulary', {
      title: 'Vocabulary 1',
      school,
    });
    const vocabulary2 = this.server.create('vocabulary', {
      title: 'Vocabulary 2',
      school,
    });
    this.server.createList('term', 2, {
      vocabulary: vocabulary1,
    });
    this.server.create('term', {
      vocabulary: vocabulary2,
    });
    const schoolModel = await this.owner.lookup('service:store').findRecord('school', school.id);
    this.set('school', schoolModel);

    await render(
      <template>
        <SchoolVocabulariesCollapsed @school={{this.school}} @expand={{(noop)}} />
      </template>,
    );

    assert.strictEqual(component.title, 'Vocabularies (2)');
    assert.strictEqual(component.vocabularies.length, 2);
    assert.strictEqual(component.vocabularies[0].title, 'Vocabulary 1');
    assert.strictEqual(component.vocabularies[0].summary, 'There are 2 terms');
    assert.strictEqual(component.vocabularies[1].title, 'Vocabulary 2');
    assert.strictEqual(component.vocabularies[1].summary, 'There is 1 term');
  });

  test('expand', async function (assert) {
    const school = this.server.create('school');
    this.server.create('vocabulary', {
      school,
    });
    const schoolModel = await this.owner.lookup('service:store').findRecord('school', school.id);

    this.set('school', schoolModel);
    this.set('expand', () => {
      assert.step('expand called');
    });
    await render(
      <template>
        <SchoolVocabulariesCollapsed @school={{this.school}} @expand={{this.expand}} />
      </template>,
    );

    await component.expand();
    assert.verifySteps(['expand called']);
  });
});
