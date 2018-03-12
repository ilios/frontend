import EmberObject from '@ember/object';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('learning-material-table-notes', 'Integration | Component | learning material table notes', {
  integration: true
});

test('it renders public notes', function (assert) {
  const row = EmberObject.create({
    publicNotes: true
  });
  const icon = '.fa-eye';
  this.set('row', row);
  this.render(hbs`{{learning-material-table-notes value=true row=row}}`);
  assert.equal(this.$().text().trim(), 'Yes');
  assert.equal(this.$(icon).length, 1);
});

test('it renders private notes', function (assert) {
  const row = EmberObject.create({
    publicNotes: false
  });
  const icon = '.fa-eye';
  this.set('row', row);
  this.render(hbs`{{learning-material-table-notes value=true row=row}}`);
  assert.equal(this.$().text().trim(), 'Yes');
  assert.equal(this.$(icon).length, 0);
});

test('it renders empty notes', function (assert) {
  const row = EmberObject.create({
    publicNotes: false
  });
  const icon = '.fa-eye';
  this.set('row', row);
  this.render(hbs`{{learning-material-table-notes value=null row=row}}`);
  assert.equal(this.$().text().trim(), 'No');
  assert.equal(this.$(icon).length, 0);
});
