import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { findAll, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { component } from 'ilios/tests/pages/components/pagination-links';

module('Integration | Component | pagination-links', function(hooks) {
  setupRenderingTest(hooks);

  test('it displays pagination links properly', async function(assert) {
    assert.expect(20);

    this.setProperties({ page: 1, results: [1], size: 1 });
    this.set('prevPage', () => this.set('page', this.page - 1));
    this.set('nextPage', () => this.set('page', this.page + 1));
    await render(hbs`
      {{pagination-links
        page=this.page
        results=this.results
        size=this.size
        onNextPage=(action this.nextPage)
        onPrevPage=(action this.prevPage)
        onSelectPage=(action (mut this.page))
      }}`);
    assert.ok(component.nextIsHidden, 'results array length needs to be greater than size for pagination to show');
    assert.ok(component.prevIsHidden, 'results array length needs to be greater than size for pagination to show');
    this.set('results', [1, 1]);
    assert.ok(component.prevDisabled, 'prev is inactive as it is page 1');
    assert.notOk(component.nextDisabled, 'next is active as it is page 1');
    const [p1, p2] = findAll('.page-button');
    assert.equal(p1.textContent.trim(), '1');
    assert.ok(p1.classList.contains('inactive'), 'has inactive class');
    assert.equal(p2.textContent.trim(), '2');
    assert.notOk(p2.classList.contains('class', 'inactive'), 'does not have inactive class');
    await component.clickNext();
    assert.notOk(component.prevDisabled, 'prev is active as it is page 2');
    assert.ok(component.nextDisabled, 'next is inactive as it is page 2');
    assert.notOk(p1.classList.contains('inactive'));
    assert.ok(p2.classList.contains('inactive'));
    await component.clickPrev();
    assert.ok(component.prevDisabled, 'prev is inactive as it is page 1');
    assert.notOk(component.nextDisabled, 'next is active as it is page 1');
    assert.ok(p1.classList.contains('inactive'));
    assert.notOk(p2.classList.contains('inactive'));
    await component.clickLastPage();
    assert.notOk(component.prevDisabled, 'prev is active as it is page 2');
    assert.ok(component.nextDisabled, 'next is inactive as it is page 2');
    assert.notOk(p1.classList.contains('inactive'));
    assert.ok(p2.classList.contains('inactive'));
  });
});
