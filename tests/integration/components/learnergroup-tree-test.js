import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

const { Object:EmberObject } = Ember;

moduleForComponent('learnergroup-tree', 'Integration | Component | learnergroup tree', {
  integration: true
});

test('it renders', function(assert) {
  let learnerGroup = EmberObject.create({
    children: []
  });
  this.set('learnerGroup', learnerGroup);
  this.set('nothing', parseInt);

  this.render(hbs`{{learnergroup-tree learnerGroup=learnerGroup add=(action nothing)}}`);

  assert.equal(this.$().text().trim(), '');
});
