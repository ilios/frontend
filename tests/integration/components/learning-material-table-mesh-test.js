import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

const { Object: EmberObject, RSVP } = Ember;
const { resolve } = RSVP;

moduleForComponent('learning-material-table-notes', 'Integration | Component | learning material table mesh', {
  integration: true
});

test('it renders with descriptors', function (assert) {
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
  const descriptor1 = `${descriptors}:eq(0)`;
  const descriptor2 = `${descriptors}:eq(1)`;
  this.render(hbs`{{learning-material-table-mesh row=row tableActions=tableActions extra=extra}}`);
  assert.equal(this.$(descriptors).length, 2);
  assert.equal(this.$(descriptor1).text().trim(), 'descriptor 1');
  assert.equal(this.$(descriptor2).text().trim(), 'descriptor 2');
});

test('it renders with no descriptor', function (assert) {
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
  this.render(hbs`{{learning-material-table-mesh row=row tableActions=tableActions extra=extra}}`);
  assert.equal(this.$().text().trim(), 'None');
});
