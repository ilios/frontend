import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';
import { resolve } from 'rsvp';

module('Integration | Component | detail terms list item', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    this.actions = {};
    this.send = (actionName, ...args) => this.actions[actionName].apply(this, args);
  });

  test('top-level', async function(assert) {
    assert.expect(1);
    const term = EmberObject.create({
      isTopLevel: true,
      title: 'Foo'
    });

    this.set('term', term);
    await render(hbs`{{detail-terms-list-item term=term canEdit=false}}`);
    assert.ok(this.$().text().trim().indexOf('Foo') !== -1);

  });

  test('nested', async function(assert) {
    assert.expect(3);
    const term = EmberObject.create({
      isTopLevel: false,
      title: 'Foo',
      allParentTitles: resolve(['Lorem', 'Ipsum'])
    });

    this.set('term', term);
    await render(hbs`{{detail-terms-list-item term=term canEdit=false}}`);
    assert.equal(this.$('.muted:eq(0)').text().trim(), 'Lorem »');
    assert.equal(this.$('.muted:eq(1)').text().trim(), 'Ipsum »');
    assert.ok(this.$().text().trim().indexOf('Foo') !== -1);
  });

  test('remove', async function(assert) {
    assert.expect(2);
    const term = EmberObject.create({
      isTopLevel: true,
      title: 'Foo',
      isActiveInTree: resolve(true)

    });

    this.set('term', term);
    this.actions.remove = (val) => {
      assert.equal(term, val);
    };
    await render(hbs`{{detail-terms-list-item term=term canEdit=true remove=(action 'remove')}}`);
    assert.equal(this.$('.fa-remove').length, 1);
    this.$('.fa-remove').click();
  });

  test('inactive', async function(assert) {
    assert.expect(2);
    const term = EmberObject.create({
      isTopLevel: true,
      title: 'Foo',
      isActiveInTree: resolve(false)
    });

    this.set('term', term);
    await render(hbs`{{detail-terms-list-item term=term canEdit=true}}`);
    assert.equal(this.$('.inactive').text().trim(), '(inactive)');
    assert.equal(this.$('.fa-remove').length, 1);
  });

  test('read-only mode', async function(assert) {
    assert.expect(2);
    const term = EmberObject.create({
      isTopLevel: true,
      title: 'Foo',
      isActiveInTree: resolve(false)
    });

    this.set('term', term);
    await render(hbs`{{detail-terms-list-item term=term canEdit=false}}`);
    assert.equal(this.$('.inactive').length, 0);
    assert.equal(this.$('.fa-remove').length, 0);
  });
});
