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
      assert.expect(15);

      const data = [
        { title: 'foo', level: 2, weeks: 10, avg: 30 },
        { title: 'bar', level: 4, weeks: 1.5, avg: 20.33 },
      ];

      this.set('data', data);
      await render(hbs`<CurriculumInventory::VerificationPreviewTable3a @data={{this.data}} />`);
      assert.strictEqual(
        component.title,
        'Table 3-A: Non-Clerkship Sequence Block Instructional Time'
      );
      assert.strictEqual(component.table.headings.length, 4);
      assert.strictEqual(component.table.headings[0].text, 'Non-Clerkship Sequence Blocks');
      assert.strictEqual(component.table.headings[1].text, 'Academic Level');
      assert.strictEqual(component.table.headings[2].text, 'Total Weeks');
      assert.strictEqual(component.table.headings[3].text, 'Average Hours of Instruction Per Week');
      assert.strictEqual(component.table.rows.length, 2);
      assert.strictEqual(component.table.rows[0].title, 'foo');
      assert.strictEqual(component.table.rows[0].level, '2');
      assert.strictEqual(component.table.rows[0].weeks, '10');
      assert.strictEqual(component.table.rows[0].avg, '30');
      assert.strictEqual(component.table.rows[1].title, 'bar');
      assert.strictEqual(component.table.rows[1].level, '4');
      assert.strictEqual(component.table.rows[1].weeks, '1.5');
      assert.strictEqual(component.table.rows[1].avg, '20.33');
    });
  }
);
