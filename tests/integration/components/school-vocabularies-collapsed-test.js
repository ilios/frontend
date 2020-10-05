import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Integration | Component | school vocabularies collapsed', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function(assert) {
    assert.expect(5);
    const school = this.server.create('school');
    const  vocabulary1 = this.server.create('vocabulary', {
      title: 'Vocabulary 1',
      school,
    });
    const  vocabulary2 = this.server.create('vocabulary', {
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
    await render(hbs`<SchoolVocabulariesCollapsed @school={{this.school}} @expand={{noop}} />`);

    const title = '.title';
    const vocabularies = 'table tbody tr';
    const vocabulary1Title = `${vocabularies}:nth-of-type(1) td:nth-of-type(1)`;
    const vocabulary1Terms = `${vocabularies}:nth-of-type(1) td:nth-of-type(2)`;
    const vocabulary2Title = `${vocabularies}:nth-of-type(2) td:nth-of-type(1)`;
    const vocabulary2Terms = `${vocabularies}:nth-of-type(2) td:nth-of-type(2)`;

    assert.dom(title).hasText('Vocabularies (2)');
    assert.dom(vocabulary1Title).hasText('Vocabulary 1');
    assert.dom(vocabulary1Terms).hasText('There are 2 terms');
    assert.dom(vocabulary2Title).hasText('Vocabulary 2');
    assert.dom(vocabulary2Terms).hasText('There is 1 term');
  });

  test('clicking the header expands the list', async function(assert) {
    assert.expect(2);
    const school = this.server.create('school');
    this.server.create('vocabulary', {
      school,
    });
    const schoolModel = await this.owner.lookup('service:store').find('school', school.id);

    this.set('school', schoolModel);
    this.set('click', () => {
      assert.ok(true, 'Action was fired');
    });
    await render(hbs`<SchoolVocabulariesCollapsed @school={{this.school}} @expand={{this.click}} />`);

    assert.dom('[data-test-title]').hasText('Vocabularies (1)');
    await click('[data-test-title]');
  });
});
