/*eslint camelcase: 0 */
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { component } from 'ilios/tests/pages/components/curriculum-inventory/verification-preview-table5';

module(
  'Integration | Component | curriculum-inventory/verification-preview-table5',
  function (hooks) {
    setupRenderingTest(hooks);
    setupIntl(hooks, 'en-us');

    test('it renders', async function (assert) {
      const data = {
        methods: ['foo', 'bar', 'baz'],
        rows: [
          {
            title: 'Alpha',
            starting_level: 1,
            ending_level: 2,
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
            starting_level: 2,
            ending_level: 3,
            methods: {
              foo: false,
              bar: true,
              baz: true,
            },
            num_exams: 3,
            has_formative_assessments: false,
            has_narrative_assessments: true,
          },
        ],
      };

      this.set('data', data);
      await render(hbs`<CurriculumInventory::VerificationPreviewTable5 @data={{this.data}} />
`);
      assert.strictEqual(
        component.title,
        'Table 5: Non-Clerkship Sequence Block Assessment Methods'
      );
      assert.strictEqual(component.table.firstHeadings.length, 4);
      assert.strictEqual(component.table.firstHeadings[0].text, 'Non-Clerkship Sequence Blocks');
      assert.strictEqual(component.table.firstHeadings[1].text, 'Phases (Start - End)');
      assert.strictEqual(component.table.firstHeadings[2].text, 'Included in Grade');
      assert.strictEqual(component.table.firstHeadings[3].text, 'Assessments');
      assert.strictEqual(component.table.secondHeadings.length, 6);
      assert.strictEqual(component.table.secondHeadings[0].text, 'Number of Exams');
      assert.strictEqual(component.table.secondHeadings[1].text, 'foo');
      assert.strictEqual(component.table.secondHeadings[2].text, 'bar');
      assert.strictEqual(component.table.secondHeadings[3].text, 'baz');
      assert.strictEqual(component.table.secondHeadings[4].text, 'Formative');
      assert.strictEqual(component.table.secondHeadings[5].text, 'Narrative');
      assert.strictEqual(component.table.rows.length, 2);
      assert.strictEqual(component.table.rows[0].cells.length, 8);
      assert.strictEqual(component.table.rows[0].cells[0].text, 'Alpha');
      assert.strictEqual(component.table.rows[0].cells[1].text, '1 - 2');
      assert.strictEqual(component.table.rows[0].cells[2].text, '1');
      assert.strictEqual(component.table.rows[0].cells[3].text, 'X');
      assert.strictEqual(component.table.rows[0].cells[4].text, '');
      assert.strictEqual(component.table.rows[0].cells[5].text, 'X');
      assert.strictEqual(component.table.rows[0].cells[6].text, 'Y');
      assert.strictEqual(component.table.rows[0].cells[7].text, '');
      assert.strictEqual(component.table.rows[1].cells[0].text, 'Beta');
      assert.strictEqual(component.table.rows[1].cells[1].text, '2 - 3');
      assert.strictEqual(component.table.rows[1].cells[2].text, '3');
      assert.strictEqual(component.table.rows[1].cells[3].text, '');
      assert.strictEqual(component.table.rows[1].cells[4].text, 'X');
      assert.strictEqual(component.table.rows[1].cells[5].text, 'X');
      assert.strictEqual(component.table.rows[1].cells[6].text, '');
      assert.strictEqual(component.table.rows[1].cells[7].text, 'Y');
    });
  }
);
