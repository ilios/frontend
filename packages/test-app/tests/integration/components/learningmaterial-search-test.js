import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'test-app/tests/test-support/mirage';
import { component } from 'ilios-common/page-objects/components/learningmaterial-search';

module('Integration | Component | learningmaterial search', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('search shows results', async function (assert) {
    this.server.createList('learning-material', 2);
    await render(hbs`<LearningmaterialSearch />
`);
    await component.search.set('material');
    assert.strictEqual(component.searchResults.length, 2);
  });

  test('empty search clears results', async function (assert) {
    this.server.createList('learning-material', 2);
    await render(hbs`<LearningmaterialSearch />
`);
    await component.search.set('    material    ');
    assert.strictEqual(component.searchResults.length, 2);
    await component.search.set('        ');
    assert.strictEqual(component.searchResults.length, 0);
  });
});
