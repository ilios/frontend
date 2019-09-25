/*eslint camelcase: 0 */
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import component from 'ilios/tests/pages/components/curriculum-inventory-verification-preview-table2';

module('Integration | Component | curriculum-inventory-verification-preview-table2', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    assert.expect(28);
    const data = {
      methods: [
        {title: 'foo', total: 200},
        {title: 'bar', total: 400},
      ],
      rows: [
        {
          title: 'Alpha',
          level: 2,
          instructional_methods: {foo: 150, bar: 400},
          total: 550
        },
        {
          title: 'Beta',
          level: 4,
          instructional_methods: {foo: 50},
          total: 50
        }
      ],
    };

    const tocId = '23';
    this.set('data', data);
    this.set('tocId', tocId);
    await render(hbs`<CurriculumInventoryVerificationPreviewTable2 @data={{data}} @tocId={{tocId}} />`);
    assert.equal(component.title, 'Table 2: Primary Instructional Method by Non-Clerkship Sequence Block');
    assert.equal(component.table.firstHeadings.length, 3);
    assert.equal(component.table.firstHeadings.objectAt(0).text, 'Non-Clerkship Sequence Blocks');
    assert.equal(component.table.firstHeadings.objectAt(1).text, 'Academic Level');
    assert.equal(component.table.firstHeadings.objectAt(2).text, 'Number of Formal Instructional Hours Per Course');
    assert.equal(component.table.secondHeadings.length, 3);
    assert.equal(component.table.secondHeadings.objectAt(0).text, 'foo');
    assert.equal(component.table.secondHeadings.objectAt(1).text, 'bar');
    assert.equal(component.table.secondHeadings.objectAt(2).text, 'Total');
    assert.equal(component.table.rows.length, 2);
    assert.equal(component.table.rows.objectAt(0).cells.length, 5);
    assert.equal(component.table.rows.objectAt(0).cells.objectAt(0).text, 'Alpha');
    assert.equal(component.table.rows.objectAt(0).cells.objectAt(1).text, '2');
    assert.equal(component.table.rows.objectAt(0).cells.objectAt(2).text, '2.50');
    assert.equal(component.table.rows.objectAt(0).cells.objectAt(3).text, '6.67');
    assert.equal(component.table.rows.objectAt(0).cells.objectAt(4).text, '9.17');
    assert.equal(component.table.rows.objectAt(1).cells.objectAt(0).text, 'Beta');
    assert.equal(component.table.rows.objectAt(1).cells.objectAt(1).text, '4');
    assert.equal(component.table.rows.objectAt(1).cells.objectAt(2).text, '0.83');
    assert.equal(component.table.rows.objectAt(1).cells.objectAt(3).text, '');
    assert.equal(component.table.rows.objectAt(1).cells.objectAt(4).text, '0.83');
    assert.equal(component.table.footer.length, 5);
    assert.equal(component.table.footer.objectAt(0).text, 'Total');
    assert.equal(component.table.footer.objectAt(1).text, '');
    assert.equal(component.table.footer.objectAt(2).text, '3.33');
    assert.equal(component.table.footer.objectAt(3).text, '6.67');
    assert.equal(component.table.footer.objectAt(4).text, '10.00');
    assert.equal(component.backToTop.link, `#${tocId}`);
  });
});
