import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { findAll, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | global-search-tags', function(hooks) {
  setupRenderingTest(hooks);

  test('it displays tags properly', async function(assert) {
    assert.expect(4);

    this.set('tags', ['terms', 'meshdescriptors', 'id', 'learningmaterials']);
    await render(hbs`{{global-search-tags tags=tags}}`);
    const [tag1, tag2, tag3, tag4] = findAll('.global-search-tag');
    assert.equal(tag1.textContent.trim(), 'Terms');
    assert.equal(tag2.textContent.trim(), 'MeSH');
    assert.equal(tag3.textContent.trim(), 'ID');
    assert.equal(tag4.textContent.trim(), 'Learning Materials');
  });
});
