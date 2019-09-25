/*eslint camelcase: 0 */
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import component from 'ilios/tests/pages/components/curriculum-inventory-verification-preview-table4';

module('Integration | Component | curriculum-inventory-verification-preview-table4', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    assert.expect(21);

    const data = [
      {id: '001', title: 'foo', num_events_primary_method: 5, num_events_non_primary_method: 10},
      {id: '002', title: 'bar', num_events_primary_method: 15, num_events_non_primary_method: 110}
    ];

    const tocId = '23';
    this.set('data', data);
    this.set('tocId', tocId);
    await render(hbs`<CurriculumInventoryVerificationPreviewTable4 @data={{data}} @tocId={{tocId}} />`);
    assert.equal(component.title, 'Table 4: Instructional Method Counts');
    assert.equal(component.table.headings.length, 4);
    assert.equal(component.table.headings.objectAt(0).text, 'Item Code');
    assert.equal(component.table.headings.objectAt(1).text, 'Instructional Method');
    assert.equal(component.table.headings.objectAt(2).text, 'Number of Events Featuring This as the Primary Method');
    assert.equal(component.table.headings.objectAt(3).text, 'Number of Non-Primary Occurrences of This Method');
    assert.equal(component.table.rows.length, 2);
    assert.equal(component.table.rows.objectAt(0).id, '001');
    assert.equal(component.table.rows.objectAt(0).title, 'foo');
    assert.equal(component.table.rows.objectAt(0).numPrimary, '5');
    assert.equal(component.table.rows.objectAt(0).numNonPrimary, '10');
    assert.equal(component.table.rows.objectAt(1).id, '002');
    assert.equal(component.table.rows.objectAt(1).title, 'bar');
    assert.equal(component.table.rows.objectAt(1).numPrimary, '15');
    assert.equal(component.table.rows.objectAt(1).numNonPrimary, '110');
    assert.equal(component.table.footer.length, 4);
    assert.equal(component.table.footer.objectAt(0).text, '');
    assert.equal(component.table.footer.objectAt(1).text, 'Total');
    assert.equal(component.table.footer.objectAt(2).text, '20');
    assert.equal(component.table.footer.objectAt(3).text, '120');
    assert.equal(component.backToTop.link, `#${tocId}`);
  });
});
