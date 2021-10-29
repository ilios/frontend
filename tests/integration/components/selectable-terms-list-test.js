import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { resolve } from 'rsvp';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Integration | Component | selectable terms list', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const vocabulary = this.server.create('vocabulary');
    const term1 = this.server.create('term', {
      title: 'Alpha',
      active: true,
      vocabulary,
    });
    const term2 = this.server.create('term', {
      title: 'Beta',
      active: true,
      vocabulary,
    });
    const term3 = this.server.create('term', {
      title: 'Gamma',
      active: true,
      vocabulary,
    });
    const term4 = this.server.create('term', {
      title: 'First',
      active: true,
      vocabulary,
      children: [term1, term2],
    });
    const term5 = this.server.create('term', {
      title: 'Second',
      active: true,
      vocabulary,
      children: [term3],
    });

    this.vocabularyModel = await this.owner
      .lookup('service:store')
      .find('vocabulary', vocabulary.id);
    this.termModel1 = await this.owner.lookup('service:store').find('term', term1.id);
    this.termModel2 = await this.owner.lookup('service:store').find('term', term2.id);
    this.termModel3 = await this.owner.lookup('service:store').find('term', term3.id);
    this.termModel4 = await this.owner.lookup('service:store').find('term', term4.id);
    this.termModel5 = await this.owner.lookup('service:store').find('term', term5.id);
  });

  test('it renders when given a vocabulary as input ', async function (assert) {
    assert.expect(7);

    this.set('selectedTerms', []);
    this.set('vocabulary', this.vocabularyModel);
    this.set('nothing', () => {});
    await render(hbs`<SelectableTermsList
      @selectedTerms={{this.selectedTerms}}
      @vocabulary={{this.vocabulary}}
      @add={{action this.nothing}}
      @remove={{action this.nothing}}
    />`);

    assert.dom('li').exists({ count: 5 });
    assert.dom('li.top-level').exists({ count: 2 });
    assert.dom('li.top-level:nth-of-type(1) .selectable-terms-list-item').hasText('First');
    assert.dom('li.top-level:nth-of-type(2) .selectable-terms-list-item').hasText('Second');
    assert
      .dom('li.top-level:nth-of-type(1) li:nth-of-type(1) .selectable-terms-list-item')
      .hasText('Alpha');
    assert
      .dom('li.top-level:nth-of-type(1) li:nth-of-type(2) .selectable-terms-list-item')
      .hasText('Beta');
    assert
      .dom('li.top-level:nth-of-type(2) li:nth-of-type(1) .selectable-terms-list-item')
      .hasText('Gamma');
  });

  test('it renders when given a list of terms as input ', async function (assert) {
    assert.expect(7);

    this.set('selectedTerms', []);
    this.set('terms', resolve([this.termModel4, this.termModel5]));
    this.set('nothing', () => {});
    await render(hbs`<SelectableTermsList
      @selectedTerms={{this.selectedTerms}}
      @terms={{await this.terms}}
      @add={{action this.nothing}}
      @remove={{action this.nothing}}
    />`);

    assert.dom('li').exists({ count: 5 });
    assert.dom('li.top-level').exists({ count: 2 });
    assert.dom('li.top-level:nth-of-type(1) .selectable-terms-list-item').hasText('First');
    assert.dom('li.top-level:nth-of-type(2) .selectable-terms-list-item').hasText('Second');
    assert
      .dom('li.top-level:nth-of-type(1) li:nth-of-type(1) .selectable-terms-list-item')
      .hasText('Alpha');
    assert
      .dom('li.top-level:nth-of-type(1) li:nth-of-type(2) .selectable-terms-list-item')
      .hasText('Beta');
    assert
      .dom('li.top-level:nth-of-type(2) li:nth-of-type(1) .selectable-terms-list-item')
      .hasText('Gamma');
  });

  test('inactive terms are not rendered', async function (assert) {
    assert.expect(4);

    this.termModel2.set('active', false);
    this.termModel3.set('active', false);
    this.termModel5.set('active', false);

    this.set('selectedTerms', []);
    this.set('terms', resolve([this.termModel4, this.termModel5]));
    this.set('nothing', () => {});
    await render(hbs`<SelectableTermsList
      @selectedTerms={{this.selectedTerms}}
      @terms={{await this.terms}}
      @add={{action this.nothing}}
      @remove={{action this.nothing}}
    />`);

    assert.dom('li').exists({ count: 2 });
    assert.dom('li.top-level').exists({ count: 1 });
    assert.dom('li.top-level:nth-of-type(1) .selectable-terms-list-item').hasText('First');
    assert
      .dom('li.top-level:nth-of-type(1) li:nth-of-type(1) .selectable-terms-list-item')
      .hasText('Alpha');
  });

  test('select/deselect term', async function (assert) {
    assert.expect(5);

    this.set('selectedTerms', []);
    this.set('terms', resolve([this.termModel4, this.termModel5]));
    this.set('add', (term) => {
      assert.strictEqual(term, this.termModel4);
      this.selectedTerms.pushObject(term);
    });
    this.set('remove', (term) => {
      assert.strictEqual(term, this.termModel4);
      this.selectedTerms.removeObject(term);
    });
    await render(hbs`<SelectableTermsList
      @selectedTerms={{this.selectedTerms}}
      @terms={{await this.terms}}
      @add={{action this.add}}
      @remove={{action this.remove}}
    />`);

    const term = 'li.top-level:nth-of-type(1) .selectable-terms-list-item';
    assert.dom(term).hasNoClass('selected');
    await click(find(term));
    assert.dom(term).hasClass('selected');
    await click(find(term));
    assert.dom(term).hasNoClass('selected');
  });

  test('filter terms', async function (assert) {
    assert.expect(4);

    this.set('selectedTerms', []);
    this.set('vocabulary', this.vocabularyModel);
    this.set('nothing', () => {});
    this.set('termFilter', 'Gamma');
    await render(hbs`<SelectableTermsList
      @selectedTerms={{this.selectedTerms}}
      @vocabulary={{this.vocabulary}}
      @add={{action this.nothing}}
      @remove={{action this.nothing}}
      @termFilter={{this.termFilter}}
    />`);

    assert.dom('li').exists({ count: 2 });
    assert.dom('li.top-level').exists({ count: 1 });
    assert.dom('li.top-level:nth-of-type(1) .selectable-terms-list-item').hasText('Second');
    assert
      .dom('li.top-level:nth-of-type(1) li:nth-of-type(1) .selectable-terms-list-item')
      .hasText('Gamma');
  });

  test('filter terms - partial match', async function (assert) {
    assert.expect(4);

    this.set('selectedTerms', []);
    this.set('vocabulary', this.vocabularyModel);
    this.set('nothing', () => {});
    this.set('termFilter', 'amma');
    await render(hbs`<SelectableTermsList
      @selectedTerms={{this.selectedTerms}}
      @vocabulary={{this.vocabulary}}
      @add={{action this.nothing}}
      @remove={{action this.nothing}}
      @termFilter={{this.termFilter}}
    />`);

    assert.dom('li').exists({ count: 2 });
    assert.dom('li.top-level').exists({ count: 1 });
    assert.dom('li.top-level:nth-of-type(1) .selectable-terms-list-item').hasText('Second');
    assert
      .dom('li.top-level:nth-of-type(1) li:nth-of-type(1) .selectable-terms-list-item')
      .hasText('Gamma');
  });
});
