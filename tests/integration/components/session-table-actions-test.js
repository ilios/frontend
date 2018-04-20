import EmberObject from '@ember/object';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('session-table-actions', 'Integration | Component | session table actions', {
  integration: true
});

test('it renders', function(assert) {
  const row = EmberObject.create({
    confirmDelete: false,
    canDelete: true
  });
  const deleteIcon = 'i.fa-trash';

  this.set('row', row);
  this.render(hbs`{{session-table-actions row=row}}`);
  assert.equal(this.$(deleteIcon).length, 1);
});

test('it does not display an icon when confirm delete is showing', function(assert) {
  const row = EmberObject.create({
    confirmDelete: true,
    canDelete: true
  });
  const deleteIcon = 'i.fa-trash';

  this.set('row', row);
  this.render(hbs`{{session-table-actions row=row}}`);
  assert.equal(this.$(deleteIcon).length, 0);
});

test('it does not display an icon when user does not have permission to delete', function(assert) {
  const row = EmberObject.create({
    confirmDelete: false,
    canDelete: false
  });
  const deleteIcon = 'i.fa-trash';

  this.set('row', row);
  this.render(hbs`{{session-table-actions row=row}}`);
  assert.equal(this.$(deleteIcon).length, 0);
});

test('clicking delete changes the row property', function(assert) {
  const row = EmberObject.create({
    confirmDelete: false,
    canDelete: true
  });
  const deleteIcon = 'i.fa-trash';

  this.set('row', row);
  this.render(hbs`{{session-table-actions row=row}}`);
  assert.equal(this.$(deleteIcon).length, 1);
  this.$(deleteIcon).click();
  assert.ok(row.get('confirmDelete'));
});
