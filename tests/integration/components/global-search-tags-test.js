import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { component } from 'ilios/tests/pages/components/global-search-tags';
import a11yAudit from 'ember-a11y-testing/test-support/audit';

module('Integration | Component | global-search-tags', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');

  test('it renders and is accessible', async function (assert) {
    this.set('tags', ['terms', 'meshdescriptors', 'id', 'learningmaterials']);
    await render(hbs`<GlobalSearchTags @tags={{this.tags}} />`);
    assert.strictEqual(component.tags.length, 4);
    assert.strictEqual(component.tags[0].text, 'Terms');
    assert.strictEqual(component.tags[1].text, 'MeSH');
    assert.strictEqual(component.tags[2].text, 'ID');
    assert.strictEqual(component.tags[3].text, 'Learning Materials');
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });
});
