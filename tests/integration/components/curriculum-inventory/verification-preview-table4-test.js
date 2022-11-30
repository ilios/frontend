/*eslint camelcase: 0 */
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { component } from 'ilios/tests/pages/components/curriculum-inventory/verification-preview-table4';

module(
  'Integration | Component | curriculum-inventory/verification-preview-table4',
  function (hooks) {
    setupRenderingTest(hooks);
    setupIntl(hooks, 'en-us');

    test('it renders', async function (assert) {
      assert.expect(20);

      const data = [
        {
          id: '001',
          title: 'foo',
          num_events_primary_method: 5,
          num_events_non_primary_method: 10,
        },
        {
          id: '002',
          title: 'bar',
          num_events_primary_method: 15,
          num_events_non_primary_method: 110,
        },
      ];

      this.set('data', data);
      await render(hbs`<CurriculumInventory::VerificationPreviewTable4 @data={{this.data}} />
`);
      assert.strictEqual(component.title, 'Table 4: Instructional Method Counts');
      assert.strictEqual(component.table.headings.length, 4);
      assert.strictEqual(component.table.headings[0].text, 'Item Code');
      assert.strictEqual(component.table.headings[1].text, 'Instructional Method');
      assert.strictEqual(
        component.table.headings[2].text,
        'Number of Events Featuring This as the Primary Method'
      );
      assert.strictEqual(
        component.table.headings[3].text,
        'Number of Non-Primary Occurrences of This Method'
      );
      assert.strictEqual(component.table.rows.length, 2);
      assert.strictEqual(component.table.rows[0].id, '001');
      assert.strictEqual(component.table.rows[0].title, 'foo');
      assert.strictEqual(component.table.rows[0].numPrimary, '5');
      assert.strictEqual(component.table.rows[0].numNonPrimary, '10');
      assert.strictEqual(component.table.rows[1].id, '002');
      assert.strictEqual(component.table.rows[1].title, 'bar');
      assert.strictEqual(component.table.rows[1].numPrimary, '15');
      assert.strictEqual(component.table.rows[1].numNonPrimary, '110');
      assert.strictEqual(component.table.footer.length, 4);
      assert.strictEqual(component.table.footer[0].text, '');
      assert.strictEqual(component.table.footer[1].text, 'Total');
      assert.strictEqual(component.table.footer[2].text, '20');
      assert.strictEqual(component.table.footer[3].text, '120');
    });
  }
);
