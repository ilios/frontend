import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import scrollIntoView from 'scroll-into-view';
import { on } from '@ember/modifier';
import { fn } from '@ember/helper';
import t from 'ember-intl/helpers/t';
import VerificationPreviewTable1 from 'frontend/components/curriculum-inventory/verification-preview-table1';
import VerificationPreviewTable2 from 'frontend/components/curriculum-inventory/verification-preview-table2';
import VerificationPreviewTable3a from 'frontend/components/curriculum-inventory/verification-preview-table3a';
import VerificationPreviewTable3b from 'frontend/components/curriculum-inventory/verification-preview-table3b';
import VerificationPreviewTable4 from 'frontend/components/curriculum-inventory/verification-preview-table4';
import VerificationPreviewTable5 from 'frontend/components/curriculum-inventory/verification-preview-table5';
import VerificationPreviewTable6 from 'frontend/components/curriculum-inventory/verification-preview-table6';
import VerificationPreviewTable7 from 'frontend/components/curriculum-inventory/verification-preview-table7';
import VerificationPreviewTable8 from 'frontend/components/curriculum-inventory/verification-preview-table8';
import LoadingSpinner from 'ilios-common/components/loading-spinner';

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
    scrollIntoView(document.getElementById(key), {
      behavior: 'smooth',
    });
  }
  <template>
    <div
      class="curriculum-inventory-verification-preview"
      data-test-curriculum-inventory-verification-preview
      ...attributes
    >
      {{#if this.tables}}
        <ul class="table-of-contents" data-test-table-of-contents>
          <li>
            <button
              class="link link-button"
              type="button"
              {{on "click" (fn this.scrollTo "table1")}}
            >
              {{t "general.table1ProgramExpectationsMappedToPcrs"}}
            </button>
          </li>
          <li>
            <button
              class="link link-button"
              type="button"
              {{on "click" (fn this.scrollTo "table2")}}
            >
              {{t "general.table2PrimaryInstructionalMethodByNonClerkshipSequenceBlock"}}
            </button>
          </li>
          <li>
            <button
              class="link link-button"
              type="button"
              {{on "click" (fn this.scrollTo "table3a")}}
            >
              {{t "general.table3aNonClerkshipSequenceBlockInstructionalTime"}}
            </button>
          </li>
          <li>
            <button
              class="link link-button"
              type="button"
              {{on "click" (fn this.scrollTo "table3b")}}
            >
              {{t "general.table3bClerkshipSequenceBlockInstructionalTime"}}
            </button>
          </li>
          <li>
            <button
              class="link link-button"
              type="button"
              {{on "click" (fn this.scrollTo "table4")}}
            >
              {{t "general.table4InstructionalMethodCounts"}}
            </button>
          </li>
          <li>
            <button
              class="link link-button"
              type="button"
              {{on "click" (fn this.scrollTo "table5")}}
            >
              {{t "general.table5NonClerkshipSequenceBlockAssessmentMethods"}}
            </button>
          </li>
          <li>
            <button
              class="link link-button"
              type="button"
              {{on "click" (fn this.scrollTo "table6")}}
            >
              {{t "general.table6ClerkshipSequenceBlockAssessmentMethods"}}
            </button>
          </li>
          <li>
            <button
              class="link link-button"
              type="button"
              {{on "click" (fn this.scrollTo "table7")}}
            >
              {{t "general.table7AllEventsWithAssessmentsTaggedAsFormativeOrSummative"}}
            </button>
          </li>
          <li>
            <button
              class="link link-button"
              type="button"
              {{on "click" (fn this.scrollTo "table8")}}
            >
              {{t "general.table8AllResourceTypes"}}
            </button>
          </li>
        </ul>
        <VerificationPreviewTable1 @data={{this.tables.program_expectations_mapped_to_pcrs}} />
        <button
          class="link link-button back-to-toc"
          type="button"
          {{on "click" (fn this.scrollTo "toc")}}
        >
          {{t "general.backToTableOfContents"}}
        </button>
        <VerificationPreviewTable2
          @data={{this.tables.primary_instructional_methods_by_non_clerkship_sequence_blocks}}
        />
        <button
          class="link link-button back-to-toc"
          type="button"
          {{on "click" (fn this.scrollTo "toc")}}
        >
          {{t "general.backToTableOfContents"}}
        </button>
        <VerificationPreviewTable3a
          @data={{this.tables.non_clerkship_sequence_block_instructional_time}}
        />
        <button
          class="link link-button back-to-toc"
          type="button"
          {{on "click" (fn this.scrollTo "toc")}}
        >
          {{t "general.backToTableOfContents"}}
        </button>
        <VerificationPreviewTable3b
          @data={{this.tables.clerkship_sequence_block_instructional_time}}
        />
        <button
          class="link link-button back-to-toc"
          type="button"
          {{on "click" (fn this.scrollTo "toc")}}
        >
          {{t "general.backToTableOfContents"}}
        </button>
        <VerificationPreviewTable4 @data={{this.tables.instructional_method_counts}} />
        <button
          class="link link-button back-to-toc"
          type="button"
          {{on "click" (fn this.scrollTo "toc")}}
        >
          {{t "general.backToTableOfContents"}}
        </button>
        <VerificationPreviewTable5
          @data={{this.tables.non_clerkship_sequence_block_assessment_methods}}
        />
        <button
          class="link link-button back-to-toc"
          type="button"
          {{on "click" (fn this.scrollTo "toc")}}
        >
          {{t "general.backToTableOfContents"}}
        </button>
        <VerificationPreviewTable6
          @data={{this.tables.clerkship_sequence_block_assessment_methods}}
        />
        <button
          class="link link-button back-to-toc"
          type="button"
          {{on "click" (fn this.scrollTo "toc")}}
        >
          {{t "general.backToTableOfContents"}}
        </button>
        <VerificationPreviewTable7
          @data={{this.tables.all_events_with_assessments_tagged_as_formative_or_summative}}
        />
        <button
          class="link link-button back-to-toc"
          type="button"
          {{on "click" (fn this.scrollTo "toc")}}
        >
          {{t "general.backToTableOfContents"}}
        </button>
        <VerificationPreviewTable8 @data={{this.tables.all_resource_types}} />
        <button
          class="link link-button back-to-toc"
          type="button"
          {{on "click" (fn this.scrollTo "toc")}}
        >
          {{t "general.backToTableOfContents"}}
        </button>
      {{else}}
        <LoadingSpinner />
      {{/if}}
    </div>
  </template>
}
