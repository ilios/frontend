import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, findAll, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';
import { resolve } from 'rsvp';

module('Integration | Component | detail terms list item', function(hooks) {
  setupRenderingTest(hooks);

  test('top-level', async function(assert) {
    assert.expect(1);
    const term = EmberObject.create({
      isTopLevel: true,
      title: 'Foo'
    });

    this.set('term', term);
    await render(hbs`{{detail-terms-list-item term=term canEdit=false}}`);
    assert.ok(this.element.textContent.trim().indexOf('Foo') !== -1);

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
    assert.equal(find('.muted').textContent.trim(), 'Lorem »');
    assert.equal(find(findAll('.muted')[1]).textContent.trim(), 'Ipsum »');
    assert.ok(this.element.textContent.trim().indexOf('Foo') !== -1);
  });

  test('remove', async function(assert) {
    assert.expect(2);
    const term = EmberObject.create({
      isTopLevel: true,
      title: 'Foo',
      isActiveInTree: resolve(true)

    });

    this.set('term', term);
    this.set('remove', val => {
      assert.equal(term, val);
    });
    await render(hbs`{{detail-terms-list-item term=term canEdit=true remove=(action remove)}}`);
    assert.equal(findAll('.fa-times').length, 1);
    await click('.fa-times');
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
    assert.equal(find('.inactive').textContent.trim(), '(inactive)');
    assert.equal(findAll('.fa-times').length, 1);
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
    assert.equal(findAll('.inactive').length, 0);
    assert.equal(findAll('.fa-times').length, 0);
  });
});
