/*eslint camelcase: 0 */
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import component from 'ilios/tests/pages/components/curriculum-inventory-verification-preview-table7';

module('Integration | Component | curriculum-inventory-verification-preview-table7', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    assert.expect(19);
    const data = [
      {id: 'AM001', title: 'foo', num_summative_assessments: 10, num_formative_assessments: 20},
      {id: 'AM003', title: 'bar', num_summative_assessments: 5, num_formative_assessments: 0},
    ];
    const tocId = '23';
    this.set('data', data);
    this.set('tocId', tocId);
    await render(hbs`<CurriculumInventoryVerificationPreviewTable7 @data={{data}} @tocId={{tocId}} />`);
    assert.equal(component.title, 'Table 7: All Events with Assessments Tagged as Formative or Summative');
    assert.equal(component.table.headings.length, 4);
    assert.equal(component.table.headings.objectAt(0).text, 'Item Code');
    assert.equal(component.table.headings.objectAt(1).text, 'Assessment Methods');
    assert.equal(component.table.headings.objectAt(2).text, 'Number of Summative Assessments');
    assert.equal(component.table.headings.objectAt(3).text, 'Number of Formative Assessments');

    assert.equal(component.table.rows.length, 2);
    assert.equal(component.table.rows.objectAt(0).id, 'AM001');
    assert.equal(component.table.rows.objectAt(0).title, 'foo');
    assert.equal(component.table.rows.objectAt(0).numSummative, '10');
    assert.equal(component.table.rows.objectAt(0).numFormative, '20');
    assert.equal(component.table.rows.objectAt(1).id, 'AM003');
    assert.equal(component.table.rows.objectAt(1).title, 'bar');
    assert.equal(component.table.rows.objectAt(1).numSummative, '5');
    assert.equal(component.table.rows.objectAt(1).numFormative, '0');

    assert.equal(component.table.footer.objectAt(0).text, '');
    assert.equal(component.table.footer.objectAt(1).text, 'Total');
    assert.equal(component.table.footer.objectAt(2).text, '15');
    assert.equal(component.table.footer.objectAt(3).text, '20');
  });
});
