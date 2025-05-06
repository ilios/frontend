/*eslint camelcase: 0 */
import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { component } from 'frontend/tests/pages/components/curriculum-inventory/verification-preview-table7';
import VerificationPreviewTable7 from 'frontend/components/curriculum-inventory/verification-preview-table7';

module(
  'Integration | Component | curriculum-inventory/verification-preview-table7',
  function (hooks) {
    setupRenderingTest(hooks);

    test('it renders', async function (assert) {
      assert.expect(19);
      const data = [
        { id: 'AM001', title: 'foo', num_summative_assessments: 10, num_formative_assessments: 20 },
        { id: 'AM003', title: 'bar', num_summative_assessments: 5, num_formative_assessments: 0 },
      ];
      this.set('data', data);
      await render(<template><VerificationPreviewTable7 @data={{this.data}} /></template>);
      assert.strictEqual(
        component.title,
        'Table 7: All Events with Assessments Tagged as Formative or Summative',
      );
      assert.strictEqual(component.table.headings.length, 4);
      assert.strictEqual(component.table.headings[0].text, 'Item Code');
      assert.strictEqual(component.table.headings[1].text, 'Assessment Methods');
      assert.strictEqual(component.table.headings[2].text, 'Number of Summative Assessments');
      assert.strictEqual(component.table.headings[3].text, 'Number of Formative Assessments');

      assert.strictEqual(component.table.rows.length, 2);
      assert.strictEqual(component.table.rows[0].id, 'AM001');
      assert.strictEqual(component.table.rows[0].title, 'foo');
      assert.strictEqual(component.table.rows[0].numSummative, '10');
      assert.strictEqual(component.table.rows[0].numFormative, '20');
      assert.strictEqual(component.table.rows[1].id, 'AM003');
      assert.strictEqual(component.table.rows[1].title, 'bar');
      assert.strictEqual(component.table.rows[1].numSummative, '5');
      assert.strictEqual(component.table.rows[1].numFormative, '0');

      assert.strictEqual(component.table.footer[0].text, '');
      assert.strictEqual(component.table.footer[1].text, 'Total');
      assert.strictEqual(component.table.footer[2].text, '15');
      assert.strictEqual(component.table.footer[3].text, '20');
    });
  },
);
