/*eslint camelcase: 0 */
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { component } from 'ilios/tests/pages/components/curriculum-inventory/verification-preview-table3a';

module(
  'Integration | Component | curriculum-inventory/verification-preview-table3a',
  function (hooks) {
    setupRenderingTest(hooks);
    setupIntl(hooks, 'en-us');

    test('it renders', async function (assert) {
      const data = [
        { title: 'foo', starting_level: 2, ending_level: 3, weeks: 10, avg: 30 },
        { title: 'bar', starting_level: 4, ending_level: 5, weeks: 1.5, avg: 20.33 },
      ];
      this.set('data', data);
      await render(hbs`<CurriculumInventory::VerificationPreviewTable3a @data={{this.data}} />`);
      assert.strictEqual(
        component.title,
        'Table 3-A: Non-Clerkship Sequence Block Instructional Time'
      );
      assert.strictEqual(component.table.headings.length, 4);
      assert.strictEqual(component.table.headings[0].text, 'Non-Clerkship Sequence Blocks');
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
  }
);
