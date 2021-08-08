import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { component } from 'ilios/tests/pages/components/curriculum-inventory/verification-preview-table8';

module(
  'Integration | Component | curriculum-inventory/verification-preview-table8',
  function (hooks) {
    setupRenderingTest(hooks);

    test('it renders', async function (assert) {
      assert.expect(12);
      const data = [
        { id: '001', title: 'foo', count: 10 },
        { id: '003', title: 'bar', count: 5 },
      ];
      this.set('data', data);
      await render(hbs`<CurriculumInventory::VerificationPreviewTable8 @data={{this.data}} />`);
      assert.equal(component.title, 'Table 8: All Resource Types');
      assert.equal(component.table.headings.length, 3);
      assert.equal(component.table.headings[0].text, 'Item Code');
      assert.equal(component.table.headings[1].text, 'Resource Types');
      assert.equal(component.table.headings[2].text, 'Number of Events');
      assert.equal(component.table.rows.length, 2);
      assert.equal(component.table.rows[0].id, '001');
      assert.equal(component.table.rows[0].title, 'foo');
      assert.equal(component.table.rows[0].count, '10');
      assert.equal(component.table.rows[1].id, '003');
      assert.equal(component.table.rows[1].title, 'bar');
      assert.equal(component.table.rows[1].count, '5');
    });
  }
);
