import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';
import { resolve } from 'rsvp';

moduleForComponent('detail-terms-list-item', 'Integration | Component | detail terms list item', {
  integration: true
});

test('top-level', function(assert) {
  assert.expect(1);
  const term = EmberObject.create({
    isTopLevel: true,
    title: 'Foo'
  });

  this.set('term', term);
  this.render(hbs`{{detail-terms-list-item term=term canEdit=false}}`);
  assert.ok(this.$().text().trim().indexOf('Foo') !== -1);

});

test('nested', function(assert) {
  assert.expect(3);
  const term = EmberObject.create({
    isTopLevel: false,
    title: 'Foo',
    allParentTitles: resolve(['Lorem', 'Ipsum'])
  });

  this.set('term', term);
  this.render(hbs`{{detail-terms-list-item term=term canEdit=false}}`);
  assert.equal(this.$('.muted:eq(0)').text().trim(), 'Lorem »');
  assert.equal(this.$('.muted:eq(1)').text().trim(), 'Ipsum »');
  assert.ok(this.$().text().trim().indexOf('Foo') !== -1);
});

test('remove', function(assert) {
  assert.expect(2);
  const term = EmberObject.create({
    isTopLevel: true,
    title: 'Foo',
    isActiveInTree: resolve(true)

  });

  this.set('term', term);
  this.on('remove', (val) => {
    assert.equal(term, val);
  });
  this.render(hbs`{{detail-terms-list-item term=term canEdit=true remove=(action 'remove')}}`);
  assert.equal(this.$('.fa-remove').length, 1);
  this.$('.fa-remove').click();
});

test('inactive', function(assert) {
  assert.expect(2);
  const term = EmberObject.create({
    isTopLevel: true,
    title: 'Foo',
    isActiveInTree: resolve(false)
  });

  this.set('term', term);
  this.render(hbs`{{detail-terms-list-item term=term canEdit=true}}`);
  assert.equal(this.$('.inactive').text().trim(), '(inactive)');
  assert.equal(this.$('.fa-remove').length, 1);
});

test('read-only mode', function(assert) {
  assert.expect(2);
  const term = EmberObject.create({
    isTopLevel: true,
    title: 'Foo',
    isActiveInTree: resolve(false)
  });

  this.set('term', term);
  this.render(hbs`{{detail-terms-list-item term=term canEdit=false}}`);
  assert.equal(this.$('.inactive').length, 0);
  assert.equal(this.$('.fa-remove').length, 0);
});
