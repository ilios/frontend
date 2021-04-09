import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { component } from 'ilios/tests/pages/components/pagination-links';

module('Integration | Component | pagination-links', function (hooks) {
  setupRenderingTest(hooks);

  test('it displays pagination links properly', async function (assert) {
    assert.expect(64);

    this.setProperties({ page: 1, results: [1], size: 1 });
    this.set('prevPage', () => this.set('page', this.page - 1));
    this.set('nextPage', () => this.set('page', this.page + 1));
    await render(hbs`<PaginationLinks
      @page={{this.page}}
      @results={{this.results}}
      @size={{this.size}}
      @onSelectPage={{set this.page}}
    />`);
    assert.ok(
      component.nextIsHidden,
      'results array length needs to be greater than size for pagination to show'
    );
    assert.ok(
      component.prevIsHidden,
      'results array length needs to be greater than size for pagination to show'
    );
    this.set('results', [1, 1]);
    const { pageLinks } = component;
    assert.ok(component.prevDisabled, 'prev is inactive as it is page 1');
    assert.notOk(component.nextDisabled, 'next is active as it is page 1');
    assert.equal(pageLinks.length, 2);
    assert.equal(pageLinks[0].text, '1');
    assert.ok(pageLinks[0].isDisabled);
    assert.equal(pageLinks[1].text, '2');
    assert.notOk(pageLinks[1].isDisabled);
    await component.clickNext();
    assert.notOk(component.prevDisabled, 'prev is active as it is page 2');
    assert.ok(component.nextDisabled, 'next is inactive as it is page 2');
    assert.notOk(pageLinks[0].isDisabled);
    assert.ok(pageLinks[1].isDisabled);
    await component.clickPrev();
    assert.ok(component.prevDisabled, 'prev is inactive as it is page 1');
    assert.notOk(component.nextDisabled, 'next is active as it is page 1');
    assert.ok(pageLinks[0].isDisabled);
    assert.notOk(pageLinks[1].isDisabled);
    await component.clickLastPage();
    assert.notOk(component.prevDisabled, 'prev is active as it is page 2');
    assert.ok(component.nextDisabled, 'next is inactive as it is page 2');
    assert.notOk(pageLinks[0].isDisabled);
    assert.ok(pageLinks[1].isDisabled);
    this.set('results', [1, 1, 1, 1, 1, 1, 1]);
    assert.equal(pageLinks.length, 7);
    assert.equal(pageLinks[0].text, '1');
    assert.equal(pageLinks[1].text, '2');
    assert.equal(pageLinks[2].text, '3');
    assert.equal(pageLinks[3].text, '4');
    assert.equal(pageLinks[4].text, '5');
    assert.equal(pageLinks[5].text, '6');
    assert.equal(pageLinks[6].text, '7');
    this.set('results', [1, 1, 1, 1, 1, 1, 1, 1, 1]);
    assert.equal(pageLinks.length, 6);
    assert.equal(pageLinks[0].text, '1');
    assert.equal(pageLinks[1].text, '2');
    assert.equal(pageLinks[2].text, '3');
    assert.equal(pageLinks[3].text, '4');
    assert.equal(pageLinks[4].text, '5');
    assert.equal(pageLinks[5].text, '9');
    this.set('page', 8);
    assert.equal(pageLinks.length, 6);
    assert.equal(pageLinks[0].text, '1');
    assert.equal(pageLinks[1].text, '5');
    assert.equal(pageLinks[2].text, '6');
    assert.equal(pageLinks[3].text, '7');
    assert.equal(pageLinks[4].text, '8');
    assert.equal(pageLinks[5].text, '9');
    this.set('page', 5);
    assert.equal(pageLinks.length, 6);
    assert.equal(pageLinks[0].text, '1');
    assert.equal(pageLinks[1].text, '4');
    assert.equal(pageLinks[2].text, '5');
    assert.equal(pageLinks[3].text, '6');
    assert.equal(pageLinks[4].text, '7');
    assert.equal(pageLinks[5].text, '9');
    this.set('page', 6);
    assert.equal(pageLinks.length, 6);
    assert.equal(pageLinks[0].text, '1');
    assert.equal(pageLinks[1].text, '5');
    assert.equal(pageLinks[2].text, '6');
    assert.equal(pageLinks[3].text, '7');
    assert.equal(pageLinks[4].text, '8');
    assert.equal(pageLinks[5].text, '9');
    this.set('page', 4);
    assert.equal(pageLinks.length, 6);
    assert.equal(pageLinks[0].text, '1');
    assert.equal(pageLinks[1].text, '2');
    assert.equal(pageLinks[2].text, '3');
    assert.equal(pageLinks[3].text, '4');
    assert.equal(pageLinks[4].text, '5');
    assert.equal(pageLinks[5].text, '9');
  });
});
