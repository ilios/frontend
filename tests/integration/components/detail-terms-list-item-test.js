import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, findAll } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';
import { resolve } from 'rsvp';

module('Integration | Component | detail terms list item', function (hooks) {
  setupRenderingTest(hooks);

  test('top-level', async function (assert) {
    assert.expect(1);
    const term = EmberObject.create({
      isTopLevel: true,
      title: 'Foo',
    });

    this.set('term', term);
    await render(hbs`<DetailTermsListItem @term={{term}} @canEdit={{false}} />`);
    assert.notStrictEqual(this.element.textContent.trim().indexOf('Foo'), -1);
  });

  test('nested', async function (assert) {
    assert.expect(3);
    const term = EmberObject.create({
      isTopLevel: false,
      title: 'Foo',
      allParentTitles: resolve(['Lorem', 'Ipsum']),
    });

    this.set('term', term);
    await render(hbs`<DetailTermsListItem @term={{term}} @canEdit={{false}} />`);
    assert.dom('.muted').includesText('Lorem »');
    assert.dom(findAll('.muted')[1]).includesText('Ipsum »');
    assert.notStrictEqual(this.element.textContent.trim().indexOf('Foo'), -1);
  });

  test('remove', async function (assert) {
    assert.expect(2);
    const term = EmberObject.create({
      isTopLevel: true,
      title: 'Foo',
      isActiveInTree: resolve(true),
    });

    this.set('term', term);
    this.set('remove', (val) => {
      assert.strictEqual(term, val);
    });
    await render(hbs`<DetailTermsListItem
      @term={{term}}
      @canEdit={{true}}
      @remove={{action remove}}
    />`);
    assert.dom('.fa-times').exists({ count: 1 });
    await click('.fa-times');
  });

  test('inactive', async function (assert) {
    assert.expect(2);
    const term = EmberObject.create({
      isTopLevel: true,
      title: 'Foo',
      isActiveInTree: resolve(false),
    });
    this.set('remove', () => {});

    this.set('term', term);
    await render(
      hbs`<DetailTermsListItem @term={{term}} @canEdit={{true}} @remove={{this.remove}} />`
    );
    assert.dom('.inactive').hasText('(inactive)');
    assert.dom('.fa-times').exists({ count: 1 });
  });

  test('read-only mode', async function (assert) {
    assert.expect(2);
    const term = EmberObject.create({
      isTopLevel: true,
      title: 'Foo',
      isActiveInTree: resolve(false),
    });

    this.set('term', term);
    await render(hbs`<DetailTermsListItem @term={{term}} @canEdit={{false}} />`);
    assert.dom('.inactive').doesNotExist();
    assert.dom('.fa-times').doesNotExist();
  });
});
