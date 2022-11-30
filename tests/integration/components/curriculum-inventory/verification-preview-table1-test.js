import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { component } from 'ilios/tests/pages/components/curriculum-inventory/verification-preview-table1';

module(
  'Integration | Component | curriculum-inventory/verification-preview-table1',
  function (hooks) {
    setupRenderingTest(hooks);
    setupIntl(hooks, 'en-us');

    test('it renders', async function (assert) {
      assert.expect(12);
      const data = [
        { title: 'bar', pcrs: ['alpha', 'beta'] },
        { title: 'foo', pcrs: [] },
      ];
      this.set('data', data);
      await render(hbs`<CurriculumInventory::VerificationPreviewTable1 @data={{this.data}} />
`);
      assert.strictEqual(component.title, 'Table 1: Program Expectations Mapped to PCRS');
      assert.strictEqual(component.table.headings.length, 3);
      assert.strictEqual(component.table.headings[0].text, 'Program Expectations ID');
      assert.strictEqual(component.table.headings[1].text, 'Program Expectations');
      assert.strictEqual(
        component.table.headings[2].text,
        'Physician Competency Reference Set (PCRS)'
      );
      assert.strictEqual(component.table.rows.length, 2);
      assert.strictEqual(component.table.rows[0].id, 'n/a');
      assert.strictEqual(component.table.rows[0].expectation, 'bar');
      assert.strictEqual(component.table.rows[0].pcrs, 'alpha beta');
      assert.strictEqual(component.table.rows[1].id, 'n/a');
      assert.strictEqual(component.table.rows[1].expectation, 'foo');
      assert.strictEqual(component.table.rows[1].pcrs, '');
    });
  }
);
