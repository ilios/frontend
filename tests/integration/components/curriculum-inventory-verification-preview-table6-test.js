/*eslint camelcase: 0 */
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import component from 'ilios/tests/pages/components/curriculum-inventory-verification-preview-table6';

module('Integration | Component | curriculum-inventory-verification-preview-table6', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    assert.expect(29);
    const data = {
      'methods': ['foo', 'bar', 'baz'],
      'rows': [
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

    const tocId = '23';
    this.set('data', data);
    this.set('tocId', tocId);
    await render(hbs`<CurriculumInventoryVerificationPreviewTable6 @data={{data}} @tocId={{tocId}} />`);
    assert.equal(component.title, 'Table 6: Clerkship Sequence Block Assessment Methods');
    assert.equal(component.table.firstHeadings.length, 4);
    assert.equal(component.table.firstHeadings.objectAt(0).text, 'Clerkship Sequence Blocks');
    assert.equal(component.table.firstHeadings.objectAt(1).text, 'Academic Level');
    assert.equal(component.table.firstHeadings.objectAt(2).text, 'Included in Grade');
    assert.equal(component.table.firstHeadings.objectAt(3).text, 'Assessments');
    assert.equal(component.table.secondHeadings.length, 5);
    assert.equal(component.table.secondHeadings.objectAt(0).text, 'foo');
    assert.equal(component.table.secondHeadings.objectAt(1).text, 'bar');
    assert.equal(component.table.secondHeadings.objectAt(2).text, 'baz');
    assert.equal(component.table.secondHeadings.objectAt(3).text, 'Formative');
    assert.equal(component.table.secondHeadings.objectAt(4).text, 'Narrative');
    assert.equal(component.table.rows.length, 2);
    assert.equal(component.table.rows.objectAt(0).cells.length, 7);
    assert.equal(component.table.rows.objectAt(0).cells.objectAt(0).text, 'Alpha');
    assert.equal(component.table.rows.objectAt(0).cells.objectAt(1).text, '1');
    assert.equal(component.table.rows.objectAt(0).cells.objectAt(2).text, 'X');
    assert.equal(component.table.rows.objectAt(0).cells.objectAt(3).text, '');
    assert.equal(component.table.rows.objectAt(0).cells.objectAt(4).text, 'X');
    assert.equal(component.table.rows.objectAt(0).cells.objectAt(5).text, 'Y');
    assert.equal(component.table.rows.objectAt(0).cells.objectAt(6).text, '');
    assert.equal(component.table.rows.objectAt(1).cells.objectAt(0).text, 'Beta');
    assert.equal(component.table.rows.objectAt(1).cells.objectAt(1).text, '2');
    assert.equal(component.table.rows.objectAt(1).cells.objectAt(2).text, '');
    assert.equal(component.table.rows.objectAt(1).cells.objectAt(3).text, 'X');
    assert.equal(component.table.rows.objectAt(1).cells.objectAt(4).text, 'X');
    assert.equal(component.table.rows.objectAt(1).cells.objectAt(5).text, '');
    assert.equal(component.table.rows.objectAt(1).cells.objectAt(6).text, 'Y');
    assert.equal(component.backToTop.link, `#${tocId}`);
  });
});
