/*eslint camelcase: 0 */
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { component } from 'ilios/tests/pages/components/curriculum-inventory-verification-preview-table5';

module('Integration | Component | curriculum-inventory-verification-preview-table5', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    assert.expect(31);
    const data = {
      methods: ['foo', 'bar', 'baz'],
      rows: [
        {
          title: 'Alpha',
          level: 1,
          methods: {
            foo: true,
            bar: false,
            baz: true,
          },
          num_exams: 1,
          has_formative_assessments: true,
          has_narrative_assessments: false,
        },
        {
          title: 'Beta',
          level: 2,
          methods: {
            foo: false,
            bar: true,
            baz: true,
          },
          num_exams: 3,
          has_formative_assessments: false,
          has_narrative_assessments: true,
        },
      ]
    };

    this.set('data', data);
    await render(hbs`<CurriculumInventoryVerificationPreviewTable5 @data={{data}} />`);
    assert.equal(component.title, 'Table 5: Non-Clerkship Sequence Block Assessment Methods');
    assert.equal(component.table.firstHeadings.length, 4);
    assert.equal(component.table.firstHeadings.objectAt(0).text, 'Non-Clerkship Sequence Blocks');
    assert.equal(component.table.firstHeadings.objectAt(1).text, 'Academic Level');
    assert.equal(component.table.firstHeadings.objectAt(2).text, 'Included in Grade');
    assert.equal(component.table.firstHeadings.objectAt(3).text, 'Assessments');
    assert.equal(component.table.secondHeadings.length, 6);
    assert.equal(component.table.secondHeadings.objectAt(0).text, 'Number of Exams');
    assert.equal(component.table.secondHeadings.objectAt(1).text, 'foo');
    assert.equal(component.table.secondHeadings.objectAt(2).text, 'bar');
    assert.equal(component.table.secondHeadings.objectAt(3).text, 'baz');
    assert.equal(component.table.secondHeadings.objectAt(4).text, 'Formative');
    assert.equal(component.table.secondHeadings.objectAt(5).text, 'Narrative');
    assert.equal(component.table.rows.length, 2);
    assert.equal(component.table.rows.objectAt(0).cells.length, 8);
    assert.equal(component.table.rows.objectAt(0).cells.objectAt(0).text, 'Alpha');
    assert.equal(component.table.rows.objectAt(0).cells.objectAt(1).text, '1');
    assert.equal(component.table.rows.objectAt(0).cells.objectAt(2).text, '1');
    assert.equal(component.table.rows.objectAt(0).cells.objectAt(3).text, 'X');
    assert.equal(component.table.rows.objectAt(0).cells.objectAt(4).text, '');
    assert.equal(component.table.rows.objectAt(0).cells.objectAt(5).text, 'X');
    assert.equal(component.table.rows.objectAt(0).cells.objectAt(6).text, 'Y');
    assert.equal(component.table.rows.objectAt(0).cells.objectAt(7).text, '');
    assert.equal(component.table.rows.objectAt(1).cells.objectAt(0).text, 'Beta');
    assert.equal(component.table.rows.objectAt(1).cells.objectAt(1).text, '2');
    assert.equal(component.table.rows.objectAt(1).cells.objectAt(2).text, '3');
    assert.equal(component.table.rows.objectAt(1).cells.objectAt(3).text, '');
    assert.equal(component.table.rows.objectAt(1).cells.objectAt(4).text, 'X');
    assert.equal(component.table.rows.objectAt(1).cells.objectAt(5).text, 'X');
    assert.equal(component.table.rows.objectAt(1).cells.objectAt(6).text, '');
    assert.equal(component.table.rows.objectAt(1).cells.objectAt(7).text, 'Y');
  });
});
