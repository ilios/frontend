import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, findAll, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | learning material table notes', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders public notes', async function(assert) {
    const row = EmberObject.create({
      publicNotes: true
    });
    const icon = '.fa-eye';
    this.set('row', row);
    await render(hbs`{{learning-material-table-notes value=true row=row}}`);
    assert.equal(find('*').textContent.trim(), 'Yes');
    assert.equal(findAll(icon).length, 1);
  });

  test('it renders private notes', async function(assert) {
    const row = EmberObject.create({
      publicNotes: false
    });
    const icon = '.fa-eye';
    this.set('row', row);
    await render(hbs`{{learning-material-table-notes value=true row=row}}`);
    assert.equal(find('*').textContent.trim(), 'Yes');
    assert.equal(findAll(icon).length, 0);
  });

  test('it renders empty notes', async function(assert) {
    const row = EmberObject.create({
      publicNotes: false
    });
    const icon = '.fa-eye';
    this.set('row', row);
    await render(hbs`{{learning-material-table-notes value=null row=row}}`);
    assert.equal(find('*').textContent.trim(), 'No');
    assert.equal(findAll(icon).length, 0);
  });
});
