import EmberObject from '@ember/object';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('session-table-expand', 'Integration | Component | session table expand', {
  integration: true
});

test('clicking toggles row state', function(assert) {
  const row = EmberObject.create({
    expanded: false
  });
  this.set('row', row);
  this.render(hbs`{{session-table-expand row=row}}`);
  const target = '.clickable';

  assert.notOk(row.get('expanded'));
  this.$(target).click();
  assert.ok(row.get('expanded'));
});
