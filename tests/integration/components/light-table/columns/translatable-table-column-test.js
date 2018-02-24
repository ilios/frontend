import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { Column } from 'ember-light-table';

module('Integration | Component | Columns | translatable-table-column', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders label', async function(assert) {
    this.set('column', new Column({ labelKey: 'general.thursday' }));

    await render(hbs`{{light-table/columns/translatable-table-column column}}`);

    assert.equal(this.$().text().trim(), 'Thursday');
  });
});