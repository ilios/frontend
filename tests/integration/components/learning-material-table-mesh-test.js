import EmberObject from '@ember/object';
import RSVP from 'rsvp';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, findAll, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

const { resolve } = RSVP;

module('Integration | Component | learning material table mesh', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders with descriptors', async function(assert) {
    const mesh1 = EmberObject.create({
      name: 'descriptor 1'
    });
    const mesh2 = EmberObject.create({
      name: 'descriptor 2'
    });
    const row = EmberObject.create({
      meshDescriptors: resolve([mesh2, mesh1]),
    });
    this.set('tableActions', {
      manageDescriptors: parseInt
    });
    this.set('extra', {
      editable: false
    });
    this.set('row', row);
    const descriptors = 'ul li';
    const descriptor1 = `${descriptors}:nth-of-type(1)`;
    const descriptor2 = `${descriptors}:nth-of-type(2)`;
    await render(hbs`{{learning-material-table-mesh row=row tableActions=tableActions extra=extra}}`);
    assert.equal(findAll(descriptors).length, 2);
    assert.equal(find(descriptor1).textContent.trim(), 'descriptor 1');
    assert.equal(find(descriptor2).textContent.trim(), 'descriptor 2');
  });

  test('it renders with no descriptor', async function(assert) {
    const row = EmberObject.create({
      meshDescriptors: resolve([]),
    });
    this.set('tableActions', {
      manageDescriptors: parseInt
    });
    this.set('extra', {
      editable: false
    });
    this.set('row', row);
    await render(hbs`{{learning-material-table-mesh row=row tableActions=tableActions extra=extra}}`);
    assert.equal(find('*').textContent.trim(), 'None');
  });
});
