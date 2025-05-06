/*eslint camelcase: 0 */
import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { component } from 'frontend/tests/pages/components/curriculum-inventory/verification-preview-table3b';
import VerificationPreviewTable3b from 'frontend/components/curriculum-inventory/verification-preview-table3b';

module(
  'Integration | Component | curriculum-inventory/verification-preview-table3b',
  function (hooks) {
    setupRenderingTest(hooks);

    test('it renders', async function (assert) {
      const data = [
        { title: 'foo', starting_level: 2, ending_level: 3, weeks: 10, avg: 30 },
        { title: 'bar', starting_level: 4, ending_level: 5, weeks: 1.5, avg: 20.33 },
      ];
      this.set('data', data);
      await render(<template><VerificationPreviewTable3b @data={{this.data}} /></template>);
      assert.strictEqual(component.title, 'Table 3-B: Clerkship Sequence Block Instructional Time');
      assert.strictEqual(component.table.headings.length, 4);
      assert.strictEqual(component.table.headings[0].text, 'Clerkship Sequence Blocks');
      assert.strictEqual(component.table.headings[1].text, 'Phases (Start - End)');
      assert.strictEqual(component.table.headings[2].text, 'Total Weeks');
      assert.strictEqual(component.table.headings[3].text, 'Average Hours of Instruction Per Week');
      assert.strictEqual(component.table.rows.length, 2);
      assert.strictEqual(component.table.rows[0].title, 'foo');
      assert.strictEqual(component.table.rows[0].startEndLevel, '2 - 3');
      assert.strictEqual(component.table.rows[0].weeks, '10');
      assert.strictEqual(component.table.rows[0].avg, '30');
      assert.strictEqual(component.table.rows[1].title, 'bar');
      assert.strictEqual(component.table.rows[1].startEndLevel, '4 - 5');
      assert.strictEqual(component.table.rows[1].weeks, '1.5');
      assert.strictEqual(component.table.rows[1].avg, '20.33');
    });
  },
);
