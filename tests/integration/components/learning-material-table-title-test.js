import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | learning material table title', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders with a type icon', async function(assert) {
    const row = EmberObject.create({
      learningMaterial: EmberObject.create({
        type: 'file',
        mimetype: 'application/pdf'
      })
    });
    const i = 'svg';
    this.set('row', row);
    await render(hbs`{{learning-material-table-title value='test' row=row}}`);

    assert.equal(find('[data-test-title]').textContent.trim(), 'test');
    assert.ok(find(i).classList.contains('fa-file-pdf'));
  });
});
