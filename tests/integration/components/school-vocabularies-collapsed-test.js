import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { component } from 'ilios/tests/pages/components/school-vocabularies-collapsed';

module('Integration | Component | school vocabularies collapsed', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
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
    const schoolModel = await this.owner.lookup('service:store').find('school', school.id);
    this.set('school', schoolModel);

    await render(hbs`<SchoolVocabulariesCollapsed @school={{this.school}} @expand={{(noop)}} />`);

    assert.strictEqual(component.title, 'Vocabularies (2)');
    assert.strictEqual(component.vocabularies.length, 2);
    assert.strictEqual(component.vocabularies[0].title, 'Vocabulary 1');
    assert.strictEqual(component.vocabularies[0].summary, 'There are 2 terms');
    assert.strictEqual(component.vocabularies[1].title, 'Vocabulary 2');
    assert.strictEqual(component.vocabularies[1].summary, 'There is 1 term');
  });

  test('expand', async function (assert) {
    assert.expect(1);
    const school = this.server.create('school');
    this.server.create('vocabulary', {
      school,
    });
    const schoolModel = await this.owner.lookup('service:store').find('school', school.id);

    this.set('school', schoolModel);
    this.set('expand', () => {
      assert.ok(true, 'expand triggered.');
    });
    await render(
      hbs`<SchoolVocabulariesCollapsed @school={{this.school}} @expand={{this.expand}} />`
    );

    await component.expand();
  });
});
