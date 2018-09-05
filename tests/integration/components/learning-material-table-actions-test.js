import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, findAll } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | learning material table actions', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    const row = EmberObject.create({
      confirmDelete: false
    });
    const deleteIcon = '.fa-trash';

    this.set('row', row);
    this.set('extra', {editable: true});
    await render(hbs`{{learning-material-table-actions row=row extra=extra}}`);
    assert.equal(findAll(deleteIcon).length, 1);
  });

  test('it does not display an icon when it should not', async function(assert) {
    const row = EmberObject.create({
      confirmDelete: true
    });
    const deleteIcon = '.fa-trash';

    this.set('row', row);
    this.set('extra', {editable: true});
    await render(hbs`{{learning-material-table-actions row=row extra=extra}}`);
    assert.equal(findAll(deleteIcon).length, 0);
  });

  test('it does not display an icon when not editable', async function(assert) {
    const row = EmberObject.create({
      confirmDelete: false
    });
    const deleteIcon = 'i.fa-trash';

    this.set('row', row);
    this.set('extra', {editable: false});
    await render(hbs`{{learning-material-table-actions row=row extra=extra}}`);
    assert.equal(findAll(deleteIcon).length, 0);
  });

  test('clicking delete changes the row property', async function(assert) {
    const row = EmberObject.create({
      confirmDelete: false,
      expanded: false
    });
    const deleteIcon = '.fa-trash';

    this.set('row', row);
    this.set('extra', {editable: true});
    await render(hbs`{{learning-material-table-actions row=row extra=extra}}`);
    assert.equal(findAll(deleteIcon).length, 1);
    await click(deleteIcon);
    assert.ok(row.get('confirmDelete'));
    assert.ok(row.get('expanded'));
  });
});
