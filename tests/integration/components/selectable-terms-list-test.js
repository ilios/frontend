import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { resolve } from 'rsvp';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Integration | Component | selectable terms list', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function(assert) {
    assert.expect(7);

    const term1 = this.server.create('term', { title: 'Alpha', active: true });
    const term2 = this.server.create('term', { title: 'Beta', active: true });
    const term3 = this.server.create('term', { title: 'Gamma', active: true });
    const term4 = this.server.create('term', { title: 'First', active: true, children: [ term1, term2 ] });
    const term5 = this.server.create('term', { title: 'Second', active: true, children: [ term3 ] });

    const termModel4 = await this.owner.lookup('service:store').find('term', term4.id);
    const termModel5 = await this.owner.lookup('service:store').find('term', term5.id);

    this.set('selectedTerms', []);
    this.set('terms', resolve([ termModel4, termModel5 ]));
    this.set('nothing', () => {});
    await render(hbs`<SelectableTermsList
      @selectedTerms={{this.selectedTerms}}
      @terms={{await this.terms}}
      @add={{action this.nothing}}
      @remove={{action this.nothing}}
    />`);

    assert.dom('li').exists({ count: 5});
    assert.dom('li.top-level').exists({ count: 2});
    assert.dom('li.top-level:nth-of-type(1) .selectable-terms-list-item').hasText('First');
    assert.dom('li.top-level:nth-of-type(2) .selectable-terms-list-item').hasText('Second');
    assert.dom('li.top-level:nth-of-type(1) li:nth-of-type(1) .selectable-terms-list-item')
      .hasText('Alpha');
    assert.dom('li.top-level:nth-of-type(1) li:nth-of-type(2) .selectable-terms-list-item')
      .hasText('Beta');
    assert.dom('li.top-level:nth-of-type(2) li:nth-of-type(1) .selectable-terms-list-item')
      .hasText('Gamma');
  });

  test('inactive terms are not rendered', async function(assert) {
    assert.expect(4);

    const term1 = this.server.create('term', { title: 'Alpha', active: true });
    const term2 = this.server.create('term', { title: 'Beta', active: false });
    const term3 = this.server.create('term', { title: 'Gamma', active: false });
    const term4 = this.server.create('term', { title: 'First', active: true, children: [ term1, term2 ] });
    const term5 = this.server.create('term', { title: 'Second', active: false, children: [ term3 ] });

    const termModel4 = await this.owner.lookup('service:store').find('term', term4.id);
    const termModel5 = await this.owner.lookup('service:store').find('term', term5.id);

    this.set('selectedTerms', []);
    this.set('terms', resolve([ termModel4, termModel5 ]));
    this.set('nothing', () => {});
    await render(hbs`<SelectableTermsList
      @selectedTerms={{this.selectedTerms}}
      @terms={{await this.terms}}
      @add={{action this.nothing}}
      @remove={{action this.nothing}}
    />`);

    assert.dom('li').exists({ count: 2});
    assert.dom('li.top-level').exists({ count: 1});
    assert.dom('li.top-level:nth-of-type(1) .selectable-terms-list-item').hasText('First');
    assert.dom('li.top-level:nth-of-type(1) li:nth-of-type(1) .selectable-terms-list-item')
      .hasText('Alpha');
  });
});
