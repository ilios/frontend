import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';

const { Object:EmberObject } = Ember;

moduleForComponent('leadership-list', 'Integration | Component | leadership list', {
  integration: true
});

test('it renders with data', function(assert) {
  assert.expect(5);
  let user1 = EmberObject.create({
    firstName: 'a',
    lastName: 'person',
    fullName: 'a b person',
  });
  let user2 = EmberObject.create({
    firstName: 'b',
    lastName: 'person',
    fullName: 'b a person',
  });
  this.set('directors', [user1]);
  this.set('administrators', [user2, user1]);

  this.render(hbs`{{leadership-list directors=directors administrators=administrators}}`);
  const directors = 'table tbody tr:eq(0) td:eq(0) li';
  const administrators = 'table tbody tr:eq(0) td:eq(1) li';

  assert.equal(this.$(directors).length, 1);
  assert.equal(this.$(directors).eq(0).text().trim(), 'a b person');
  assert.equal(this.$(administrators).length, 2);
  assert.equal(this.$(administrators).eq(0).text().trim(), 'a b person');
  assert.equal(this.$(administrators).eq(1).text().trim(), 'b a person');
});

test('it renders without data', function(assert) {
  assert.expect(4);
  this.set('directors', []);
  this.set('administrators', []);

  this.render(hbs`{{leadership-list directors=directors administrators=administrators}}`);
  const directors = 'table tbody tr:eq(0) td:eq(0) li';
  const administrators = 'table tbody tr:eq(0) td:eq(1) li';

  assert.equal(this.$(directors).length, 1);
  assert.equal(this.$(directors).eq(0).text().trim(), 'None');
  assert.equal(this.$(administrators).length, 1);
  assert.equal(this.$(administrators).eq(0).text().trim(), 'None');
});
