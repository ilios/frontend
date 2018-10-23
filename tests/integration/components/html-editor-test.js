import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, findAll } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { later } from '@ember/runloop';

module('Integration | Component | html editor', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    await render(hbs`{{html-editor}}`);

    await later(() => {
      // Currently, Froala cannot be configured at the add-on level.
      // Therefore, there is no point of testing custom config.
      // Instead, let's just check for the editor rendering with default settings.
      // @todo revisit later [ST 2018/10/22]
      assert.equal(this.element.textContent.trim(), 'BoldItalicSubscriptSuperscript');
      //assert.equal(this.element.textContent.trim(), 'BoldItalicSubscriptSuperscriptOrdered ListUnordered ListInsert Link');
      assert.equal(findAll('svg').length, 4);
      //assert.equal(findAll('svg').length, 7);
    }, 500);
  });
});
