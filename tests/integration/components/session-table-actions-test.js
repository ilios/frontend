import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | session table actions', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    const row = EmberObject.create({
      confirmDelete: false
    });
    const deleteIcon = 'i.fa-trash';

    this.set('row', row);
    await render(hbs`{{session-table-actions row=row}}`);
    assert.equal(this.$(deleteIcon).length, 1);
  });

  test('it does not display an icon when it should not', async function(assert) {
    const row = EmberObject.create({
      confirmDelete: true
    });
    const deleteIcon = 'i.fa-trash';

    this.set('row', row);
    await render(hbs`{{session-table-actions row=row}}`);
    assert.equal(this.$(deleteIcon).length, 0);
  });

  test('clicking delete changes the row property', async function(assert) {
    const row = EmberObject.create({
      confirmDelete: false
    });
    const deleteIcon = 'i.fa-trash';

    this.set('row', row);
    await render(hbs`{{session-table-actions row=row}}`);
    assert.equal(this.$(deleteIcon).length, 1);
    this.$(deleteIcon).click();
    assert.ok(row.get('confirmDelete'));
  });
});
