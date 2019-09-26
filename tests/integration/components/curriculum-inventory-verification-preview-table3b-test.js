import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { component } from 'ilios/tests/pages/components/curriculum-inventory-verification-preview-table3b';

module('Integration | Component | curriculum-inventory-verification-preview-table3b', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    assert.expect(15);

    const data = [
      {title: 'foo', level: 2, weeks: 10, avg: 30},
      {title: 'bar', level: 4, weeks: 1.5, avg: 20.33},
    ];

    this.set('data', data);
    await render(hbs`<CurriculumInventoryVerificationPreviewTable3b @data={{data}} />`);
    assert.equal(component.title, 'Table 3-B: Clerkship Sequence Block Instructional Time');
    assert.equal(component.table.headings.length, 4);
    assert.equal(component.table.headings.objectAt(0).text, 'Clerkship Sequence Blocks');
    assert.equal(component.table.headings.objectAt(1).text, 'Academic Level');
    assert.equal(component.table.headings.objectAt(2).text, 'Total Weeks');
    assert.equal(component.table.headings.objectAt(3).text, 'Average Hours of Instruction Per Week');
    assert.equal(component.table.rows.length, 2);
    assert.equal(component.table.rows.objectAt(0).title, 'foo');
    assert.equal(component.table.rows.objectAt(0).level, '2');
    assert.equal(component.table.rows.objectAt(0).weeks, '10');
    assert.equal(component.table.rows.objectAt(0).avg, '30');
    assert.equal(component.table.rows.objectAt(1).title, 'bar');
    assert.equal(component.table.rows.objectAt(1).level, '4');
    assert.equal(component.table.rows.objectAt(1).weeks, '1.5');
    assert.equal(component.table.rows.objectAt(1).avg, '20.33');
  });
});
