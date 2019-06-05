import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { component } from 'ilios/tests/pages/components/global-search';

module('Integration | Component | global-search', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    assert.expect(1);

    await render(hbs`{{global-search}}`);
    assert.dom('[data-test-global-search-box]').exists({ count: 1 });
  });

  test('handles empty and non-empty query', async function(assert) {
    assert.expect(2);

    this.set('query', '');
    await render(hbs`{{global-search query=this.query}}`);
    assert.ok(component.noResultsIsVisible);
    this.set('query', 'hello world');
    assert.notOk(component.noResultsIsVisible);
  });

  test('bubbles action properly', async function(assert) {
    assert.expect(1);

    this.set('query', (value) => assert.equal(value, 'typed it'));
    await render(hbs`{{global-search onQuery=(action this.query)}}`);
    await component.input('typed it');
    await component.clickIcon();
  });
});
