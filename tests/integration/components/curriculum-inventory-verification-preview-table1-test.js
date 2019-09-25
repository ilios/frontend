import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import component from 'ilios/tests/pages/components/curriculum-inventory-verification-preview-table1';

module('Integration | Component | curriculum-inventory-verification-preview-table1', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    assert.expect(13);
    const data = [
      {title: 'bar', pcrs: ['alpha', 'beta']},
      {title: 'foo', pcrs: [] },
    ];
    const tocId = '23';
    this.set('data', data);
    this.set('tocId', tocId);
    await render(hbs`<CurriculumInventoryVerificationPreviewTable1 @data={{data}} @tocId={{tocId}} />`);
    assert.equal(component.title, 'Table 1: Program Expectations Mapped to PCRS');
    assert.equal(component.table.headings.length, 3);
    assert.equal(component.table.headings.objectAt(0).text, 'Program Expectations ID');
    assert.equal(component.table.headings.objectAt(1).text, 'Program Expectations');
    assert.equal(component.table.headings.objectAt(2).text, 'Physician Competency Reference Set (PCRS)');
    assert.equal(component.table.rows.length, 2);
    assert.equal(component.table.rows.objectAt(0).id, 'n/a');
    assert.equal(component.table.rows.objectAt(0).expectation, 'bar');
    assert.equal(component.table.rows.objectAt(0).pcrs, 'alpha beta');
    assert.equal(component.table.rows.objectAt(1).id, 'n/a');
    assert.equal(component.table.rows.objectAt(1).expectation, 'foo');
    assert.equal(component.table.rows.objectAt(1).pcrs, '');
    assert.equal(component.backToTop.link, `#${tocId}`);
  });
});
