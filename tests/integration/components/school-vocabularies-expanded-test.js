import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Integration | Component | school vocabularies expanded', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function(assert) {
    assert.expect(1);
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
    await render(hbs`<SchoolVocabulariesExpanded
      @school={{this.school}}
      @expand={{noop}}
      @collapse={{noop}}
      @setSchoolManagedVocabulary={{noop}}
      @setSchoolManagedVocabularyTerm={{noop}}
    />`);
    assert.dom('[data-test-title]').hasText('Vocabularies (2)');
  });
});
