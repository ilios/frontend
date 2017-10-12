import EmberObject from '@ember/object';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('session-table-status', 'Integration | Component | session table status', {
  integration: true
});

test('it renders published', function(assert) {
  const i = 'i';
  const row = EmberObject.create({
    isPublished: true,
    publishedAsTbd: false,
  });
  this.set('row', row);
  this.render(hbs`{{session-table-status row=row}}`);

  assert.equal(this.$().text().trim(), '');
  assert.ok(this.$(i).hasClass('fa-star'));
});

test('it renders scheduled', async function(assert) {
  const i = 'i';
  const row = EmberObject.create({
    isPublished: true,
    publishedAsTbd: true,
  });
  this.set('row', row);
  this.render(hbs`{{session-table-status row=row}}`);

  assert.equal(this.$().text().trim(), '');
  assert.ok(this.$(i).hasClass('fa-clock-o'));
});

test('it renders draft', async function(assert) {
  const i = 'i';
  const row = EmberObject.create({
    isPublished: false,
    publishedAsTbd: false,
  });
  this.set('row', row);
  this.render(hbs`{{session-table-status row=row}}`);

  assert.equal(this.$().text().trim(), '');
  assert.ok(this.$(i).hasClass('fa-star-half-full'));
});
