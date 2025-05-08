import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';

export default class CurriculumInventorySequenceBlockDetailsComponent extends Component {
  @cached
  get allParentsData() {
    return new TrackedAsyncData(this.args.sequenceBlock.getAllParents(this.args.sequenceBlock));
  }

  get allParents() {
    return this.allParentsData.isResolved ? this.allParentsData.value : [];
  }
}

<div data-test-curriculum-inventory-sequence-block-details ...attributes>
  <CurriculumInventory::SequenceBlockHeader
    @canUpdate={{@canUpdate}}
    @sequenceBlock={{@sequenceBlock}}
  />
  <div class="breadcrumbs" data-test-breadcrumbs>
    <span data-test-report-crumb>
      <LinkTo @route="curriculum-inventory-report" @model={{@sequenceBlock.report}}>
        {{t "general.curriculumInventoryReport"}}
      </LinkTo>
    </span>
    {{#each (reverse this.allParents) as |parent|}}
      <span data-test-block-crumb>
        <LinkTo @route="curriculum-inventory-sequence-block" @model={{parent}}>
          {{parent.title}}
        </LinkTo>
      </span>
    {{/each}}
    <span data-test-block-crumb>
      {{@sequenceBlock.title}}
    </span>
  </div>
  <CurriculumInventory::SequenceBlockOverview
    @sequenceBlock={{@sequenceBlock}}
    @canUpdate={{@canUpdate}}
    @sortBy={{@sortSessionsBy}}
    @setSortBy={{@setSortSessionBy}}
  />
</div>