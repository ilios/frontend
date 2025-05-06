import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { setupMirage } from 'test-app/tests/test-support/mirage';
import { component } from 'ilios-common/page-objects/components/learningmaterial-search';
import LearningmaterialSearch from 'ilios-common/components/learningmaterial-search';

module('Integration | Component | learningmaterial search', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('search shows results', async function (assert) {
    this.server.createList('learning-material', 2);
    await render(<template><LearningmaterialSearch /></template>);
    await component.search.set('material');
    assert.strictEqual(component.searchResults.length, 2);
  });

  test('empty search clears results', async function (assert) {
    this.server.createList('learning-material', 2);
    await render(<template><LearningmaterialSearch /></template>);
    await component.search.set('    material    ');
    assert.strictEqual(component.searchResults.length, 2);
    await component.search.set('        ');
    assert.strictEqual(component.searchResults.length, 0);
  });

  test('search does not show Search More button if result count is same as searchResultsPerPage', async function (assert) {
    this.set('searchResultsPerPage', 50);
    this.server.createList('learning-material', this.searchResultsPerPage);
    await render(<template><LearningmaterialSearch /></template>);
    await component.search.set('    material    ');
    assert.strictEqual(component.searchResults.length, this.searchResultsPerPage);
    assert.dom('[data-test-show-more]').doesNotExist();
  });

  test('search shows Search More button if result count above searchResultsPerPage', async function (assert) {
    this.set('searchResultsPerPage', 50);
    this.server.createList('learning-material', this.searchResultsPerPage + 1);
    await render(<template><LearningmaterialSearch /></template>);
    await component.search.set('    material    ');
    assert.strictEqual(component.searchResults.length, this.searchResultsPerPage + 1);
    assert.dom('[data-test-show-more]').exists();
  });
});
