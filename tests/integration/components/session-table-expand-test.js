import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | session table expand', function(hooks) {
  setupRenderingTest(hooks);

  test('clicking toggles row state', async function(assert) {
    const row = EmberObject.create({
      expanded: false
    });
    this.set('row', row);
    await render(hbs`{{session-table-expand row=row}}`);
    const target = '.clickable';

    assert.notOk(row.get('expanded'));
    await click(target);
    assert.ok(row.get('expanded'));
  });
});
