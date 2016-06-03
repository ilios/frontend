import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

const { Object } = Ember;

moduleForComponent('learnergroup-tree', 'Integration | Component | learnergroup tree', {
  integration: true
});

test('it renders', function(assert) {
  let learnerGroup = Object.create({
    children: []
  });
  this.set('learnerGroup', learnerGroup);
  this.set('nothing', parseInt);

  this.render(hbs`{{learnergroup-tree learnerGroup=learnerGroup add=(action nothing)}}`);

  assert.equal(this.$().text().trim(), '');
});
