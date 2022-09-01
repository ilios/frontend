import { module, test } from 'qunit';
import { setupRenderingTest } from 'dummy/tests/helpers';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { component } from 'ilios-common/page-objects/components/learningmaterial-search';

module('Integration | Component | learningmaterial search', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  test('search shows results', async function (assert) {
    assert.expect(1);
    this.server.createList('learning-material', 2);
    await render(hbs`<LearningmaterialSearch />`);
    await component.search.set('material');
    assert.strictEqual(component.searchResults.length, 2);
  });

  test('empty search clears results', async function (assert) {
    assert.expect(2);
    this.server.createList('learning-material', 2);
    await render(hbs`<LearningmaterialSearch />`);
    await component.search.set('    material    ');
    assert.strictEqual(component.searchResults.length, 2);
    await component.search.set('        ');
    assert.strictEqual(component.searchResults.length, 0);
  });
});
