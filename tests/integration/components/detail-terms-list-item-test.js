import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render, click, findAll } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Integration | Component | detail terms list item', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  hooks.beforeEach(function () {
    this.vocabulary = this.server.create('vocabulary');
  });

  test('top-level', async function (assert) {
    const term = this.server.create('term', {
      vocabulary: this.vocabulary,
      title: 'Foo',
    });
    const termModel = await this.owner.lookup('service:store').find('term', term.id);
    this.set('term', termModel);
    await render(hbs`<DetailTermsListItem @term={{this.term}} @canEdit={{false}} />`);
    assert.notStrictEqual(this.element.textContent.trim().indexOf('Foo'), -1);
  });

  test('nested', async function (assert) {
    const term = this.server.create('term', {
      vocabulary: this.vocabulary,
      title: 'Lorem',
    });
    const term2 = this.server.create('term', {
      vocabulary: this.vocabulary,
      title: 'Ipsum',
      parent: term,
    });
    const term3 = this.server.create('term', {
      vocabulary: this.vocabulary,
      title: 'Foo',
      parent: term2,
    });
    const termModel = await this.owner.lookup('service:store').find('term', term3.id);
    this.set('term', termModel);
    await render(hbs`<DetailTermsListItem @term={{this.term}} @canEdit={{false}} />`);
    assert.dom('.muted').includesText('Lorem »');
    assert.dom(findAll('.muted')[1]).includesText('Ipsum »');
    assert.notStrictEqual(this.element.textContent.trim().indexOf('Foo'), -1);
  });

  test('remove', async function (assert) {
    assert.expect(2);
    const term = this.server.create('term', {
      vocabulary: this.vocabulary,
      title: 'Foo',
    });
    const termModel = await this.owner.lookup('service:store').find('term', term.id);
    this.set('term', termModel);
    this.set('remove', (val) => {
      assert.strictEqual(termModel, val);
    });
    await render(hbs`<DetailTermsListItem
      @term={{this.term}}
      @canEdit={{true}}
      @remove={{this.remove}}
    />`);
    assert.dom('.fa-times').exists({ count: 1 });
    await click('.fa-times');
  });

  test('inactive', async function (assert) {
    const term = this.server.create('term', {
      vocabulary: this.vocabulary,
      title: 'Foo',
    });
    const termModel = await this.owner.lookup('service:store').find('term', term.id);
    this.set('term', termModel);
    await render(
      hbs`<DetailTermsListItem @term={{this.term}} @canEdit={{true}} @remove={{(noop)}} />`
    );
    assert.dom('.inactive').hasText('(inactive)');
    assert.dom('.fa-times').exists({ count: 1 });
  });

  test('read-only mode', async function (assert) {
    const term = this.server.create('term', {
      vocabulary: this.vocabulary,
      title: 'Foo',
    });
    const termModel = await this.owner.lookup('service:store').find('term', term.id);
    this.set('term', termModel);
    await render(hbs`<DetailTermsListItem @term={{this.term}} @canEdit={{false}} />`);
    assert.dom('.inactive').doesNotExist();
    assert.dom('.fa-times').doesNotExist();
  });
});
