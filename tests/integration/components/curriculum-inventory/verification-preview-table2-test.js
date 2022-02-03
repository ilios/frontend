/*eslint camelcase: 0 */
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { component } from 'ilios/tests/pages/components/curriculum-inventory/verification-preview-table2';

module(
  'Integration | Component | curriculum-inventory/verification-preview-table2',
  function (hooks) {
    setupRenderingTest(hooks);
    setupIntl(hooks, 'en-us');

    test('it renders', async function (assert) {
      const data = {
        methods: [
          { title: 'foo', total: 200 },
          { title: 'bar', total: 400 },
        ],
        rows: [
          {
            title: 'Alpha',
            starting_level: 2,
            ending_level: 3,
            instructional_methods: { foo: 150, bar: 400 },
            total: 550,
          },
          {
            title: 'Beta',
            starting_level: 4,
            ending_level: 5,
            instructional_methods: { foo: 50 },
            total: 50,
          },
        ],
      };

      this.set('data', data);
      await render(hbs`<CurriculumInventory::VerificationPreviewTable2 @data={{this.data}} />`);
      assert.strictEqual(
        component.title,
        'Table 2: Primary Instructional Method by Non-Clerkship Sequence Block'
      );
      assert.strictEqual(component.table.firstHeadings.length, 4);
      assert.strictEqual(component.table.firstHeadings[0].text, 'Non-Clerkship Sequence Blocks');
      assert.strictEqual(component.table.firstHeadings[1].text, 'Start Level');
      assert.strictEqual(component.table.firstHeadings[2].text, 'End Level');
      assert.strictEqual(
        component.table.firstHeadings[3].text,
        'Number of Formal Instructional Hours Per Course'
      );
      assert.strictEqual(component.table.secondHeadings.length, 3);
      assert.strictEqual(component.table.secondHeadings[0].text, 'foo');
      assert.strictEqual(component.table.secondHeadings[1].text, 'bar');
      assert.strictEqual(component.table.secondHeadings[2].text, 'Total');
      assert.strictEqual(component.table.rows.length, 2);
      assert.strictEqual(component.table.rows[0].cells.length, 6);
      assert.strictEqual(component.table.rows[0].cells[0].text, 'Alpha');
      assert.strictEqual(component.table.rows[0].cells[1].text, '2');
      assert.strictEqual(component.table.rows[0].cells[2].text, '3');
      assert.strictEqual(component.table.rows[0].cells[3].text, '2.50');
      assert.strictEqual(component.table.rows[0].cells[4].text, '6.67');
      assert.strictEqual(component.table.rows[0].cells[5].text, '9.17');
      assert.strictEqual(component.table.rows[1].cells[0].text, 'Beta');
      assert.strictEqual(component.table.rows[1].cells[1].text, '4');
      assert.strictEqual(component.table.rows[1].cells[2].text, '5');
      assert.strictEqual(component.table.rows[1].cells[3].text, '0.83');
      assert.strictEqual(component.table.rows[1].cells[4].text, '');
      assert.strictEqual(component.table.rows[1].cells[5].text, '0.83');
      assert.strictEqual(component.table.footer.length, 6);
      assert.strictEqual(component.table.footer[0].text, 'Total');
      assert.strictEqual(component.table.footer[1].text, '');
      assert.strictEqual(component.table.footer[2].text, '');
      assert.strictEqual(component.table.footer[3].text, '3.33');
      assert.strictEqual(component.table.footer[4].text, '6.67');
      assert.strictEqual(component.table.footer[5].text, '10.00');
    });
  }
);
