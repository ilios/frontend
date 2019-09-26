/*eslint camelcase: 0 */
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import Service from '@ember/service';
import hbs from 'htmlbars-inline-precompile';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import component from 'ilios/tests/pages/components/curriculum-inventory-verification-preview';

module('Integration | Component | curriculum-inventory-verification-preview', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function(assert) {
    assert.expect(28);
    const ajaxMock = Service.extend({
      async request() {
        return {
          preview: {
            program_expectations_mapped_to_pcrs: [],
            primary_instructional_methods_by_non_clerkship_sequence_blocks: {methods: [], rows: []},
            non_clerkship_sequence_block_instructional_time: [],
            clerkship_sequence_block_instructional_time: [],
            instructional_method_counts: [],
            non_clerkship_sequence_block_assessment_methods: {methods: [], rows: []},
            clerkship_sequence_block_assessment_methods: {methods: [], rows: []},
            all_events_with_assessments_tagged_as_formative_or_summative: [],
            all_resource_types:[],
          }
        };
      },
    });
    this.owner.register('service:commonAjax', ajaxMock);
    this.server.create('curriculum-inventory-report', {
      name: 'Foo Bar 2019'
    });
    const report = await this.owner.lookup('service:store').find('curriculum-inventory-report', 1);
    this.set('report', report);
    await render(hbs`<CurriculumInventoryVerificationPreview @report={{report}} />`);
    assert.equal(component.tableOfContents.items.length, 9);
    assert.equal(component.tableOfContents.items.objectAt(0).text, 'Table 1: Program Expectations Mapped to PCRS');
    assert.equal(component.tableOfContents.items.objectAt(0).link, '#verification-preview-table1');
    assert.equal(component.tableOfContents.items.objectAt(1).text, 'Table 2: Primary Instructional Method by Non-Clerkship Sequence Block');
    assert.equal(component.tableOfContents.items.objectAt(1).link, '#verification-preview-table2');
    assert.equal(component.tableOfContents.items.objectAt(2).text, 'Table 3-A: Non-Clerkship Sequence Block Instructional Time');
    assert.equal(component.tableOfContents.items.objectAt(2).link, '#verification-preview-table3a');
    assert.equal(component.tableOfContents.items.objectAt(3).text, 'Table 3-B: Clerkship Sequence Block Instructional Time');
    assert.equal(component.tableOfContents.items.objectAt(3).link, '#verification-preview-table3b');
    assert.equal(component.tableOfContents.items.objectAt(4).text, 'Table 4: Instructional Method Counts');
    assert.equal(component.tableOfContents.items.objectAt(4).link, '#verification-preview-table4');
    assert.equal(component.tableOfContents.items.objectAt(5).text, 'Table 5: Non-Clerkship Sequence Block Assessment Methods');
    assert.equal(component.tableOfContents.items.objectAt(5).link, '#verification-preview-table5');
    assert.equal(component.tableOfContents.items.objectAt(6).text, 'Table 6: Clerkship Sequence Block Assessment Methods');
    assert.equal(component.tableOfContents.items.objectAt(6).link, '#verification-preview-table6');
    assert.equal(component.tableOfContents.items.objectAt(7).text, 'Table 7: All Events with Assessments Tagged as Formative or Summative');
    assert.equal(component.tableOfContents.items.objectAt(7).link, '#verification-preview-table7');
    assert.equal(component.tableOfContents.items.objectAt(8).text,'Table 8: All Resource Types');
    assert.equal(component.tableOfContents.items.objectAt(8).link, '#verification-preview-table8');
    assert.equal(component.table1.title, 'Table 1: Program Expectations Mapped to PCRS');
    assert.equal(component.table2.title, 'Table 2: Primary Instructional Method by Non-Clerkship Sequence Block');
    assert.equal(component.table3a.title, 'Table 3-A: Non-Clerkship Sequence Block Instructional Time');
    assert.equal(component.table3b.title, 'Table 3-B: Clerkship Sequence Block Instructional Time');
    assert.equal(component.table4.title, 'Table 4: Instructional Method Counts');
    assert.equal(component.table5.title, 'Table 5: Non-Clerkship Sequence Block Assessment Methods');
    assert.equal(component.table6.title, 'Table 6: Clerkship Sequence Block Assessment Methods');
    assert.equal(component.table7.title, 'Table 7: All Events with Assessments Tagged as Formative or Summative');
    assert.equal(component.table8.title, 'Table 8: All Resource Types');


  });
});
