import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import t from 'ember-intl/helpers/t';
import VerificationPreviewTable1 from './verification-preview-table1';
import VerificationPreviewTable2 from './verification-preview-table2';
import VerificationPreviewTable3a from './verification-preview-table3a';
import VerificationPreviewTable3b from './verification-preview-table3b';
import VerificationPreviewTable4 from './verification-preview-table4';
import VerificationPreviewTable5 from './verification-preview-table5';
import VerificationPreviewTable6 from './verification-preview-table6';
import VerificationPreviewTable7 from './verification-preview-table7';
import VerificationPreviewTable8 from './verification-preview-table8';
import LoadingSpinner from 'ilios-common/components/loading-spinner';
import scrollIntoView from 'ilios-common/utils/scroll-into-view';

export default class CurriculumInventoryVerificationPreviewComponent extends Component {
  @service fetch;
  @service iliosConfig;
  @tracked tables = null;

  constructor() {
    super(...arguments);
    this.load.perform(null, [this.args.report]);
  }

  load = task(async (element, [report]) => {
    const url = `${this.iliosConfig.apiNameSpace}/curriculuminventoryreports/${report.id}/verificationpreview`;
    const data = await this.fetch.getJsonFromApiHost(url);
    this.tables = data.preview;
  });

  @action
  scrollTo(key) {
    scrollIntoView(document.getElementById(key));
  }
  <template>
    <div
      class="curriculum-inventory-verification-preview"
      data-test-curriculum-inventory-verification-preview
      ...attributes
    >
      {{#if this.tables}}
        <ul class="table-of-contents" id="toc" data-test-table-of-contents>
          <li>
            <a href="#table1">
              {{t "general.table1ProgramExpectationsMappedToPcrs"}}
            </a>
          </li>
          <li>
            <a href="#table2">
              {{t "general.table2PrimaryInstructionalMethodByNonClerkshipSequenceBlock"}}
            </a>
          </li>
          <li>
            <a href="#table3a">
              {{t "general.table3aNonClerkshipSequenceBlockInstructionalTime"}}
            </a>
          </li>
          <li>
            <a href="#table3b">
              {{t "general.table3bClerkshipSequenceBlockInstructionalTime"}}
            </a>
          </li>
          <li>
            <a href="#table4">
              {{t "general.table4InstructionalMethodCounts"}}
            </a>
          </li>
          <li>
            <a href="#table5">
              {{t "general.table5NonClerkshipSequenceBlockAssessmentMethods"}}
            </a>
          </li>
          <li>
            <a href="#table6">
              {{t "general.table6ClerkshipSequenceBlockAssessmentMethods"}}
            </a>
          </li>
          <li>
            <a href="#table7">
              {{t "general.table7AllEventsWithAssessmentsTaggedAsFormativeOrSummative"}}
            </a>
          </li>
          <li>
            <a href="#table8">
              {{t "general.table8AllResourceTypes"}}
            </a>
          </li>
        </ul>
        <VerificationPreviewTable1 @data={{this.tables.program_expectations_mapped_to_pcrs}} />
        <a href="#toc" class="back-to-toc">
          {{t "general.backToTableOfContents"}}
        </a>
        <VerificationPreviewTable2
          @data={{this.tables.primary_instructional_methods_by_non_clerkship_sequence_blocks}}
        />
        <a href="#toc" class="back-to-toc">
          {{t "general.backToTableOfContents"}}
        </a>
        <VerificationPreviewTable3a
          @data={{this.tables.non_clerkship_sequence_block_instructional_time}}
        />
        <a href="#toc" class="back-to-toc">
          {{t "general.backToTableOfContents"}}
        </a>
        <VerificationPreviewTable3b
          @data={{this.tables.clerkship_sequence_block_instructional_time}}
        />
        <a href="#toc" class="back-to-toc">
          {{t "general.backToTableOfContents"}}
        </a>
        <VerificationPreviewTable4 @data={{this.tables.instructional_method_counts}} />
        <a href="#toc" class="back-to-toc">
          {{t "general.backToTableOfContents"}}
        </a>
        <VerificationPreviewTable5
          @data={{this.tables.non_clerkship_sequence_block_assessment_methods}}
        />
        <a href="#toc" class="back-to-toc">
          {{t "general.backToTableOfContents"}}
        </a>
        <VerificationPreviewTable6
          @data={{this.tables.clerkship_sequence_block_assessment_methods}}
        />
        <a href="#toc" class="back-to-toc">
          {{t "general.backToTableOfContents"}}
        </a>
        <VerificationPreviewTable7
          @data={{this.tables.all_events_with_assessments_tagged_as_formative_or_summative}}
        />
        <a href="#toc" class="back-to-toc">
          {{t "general.backToTableOfContents"}}
        </a>
        <VerificationPreviewTable8 @data={{this.tables.all_resource_types}} />
        <a href="#toc" class="back-to-toc">
          {{t "general.backToTableOfContents"}}
        </a>
      {{else}}
        <LoadingSpinner />
      {{/if}}
    </div>
  </template>
}
