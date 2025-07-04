import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { service } from '@ember/service';
import { TrackedAsyncData } from 'ember-async-data';
import SequenceBlockHeader from 'frontend/components/curriculum-inventory/sequence-block-header';
import { LinkTo } from '@ember/routing';
import t from 'ember-intl/helpers/t';
import reverse from 'ilios-common/helpers/reverse';
import { pageTitle } from 'ember-page-title';
import SequenceBlockOverview from 'frontend/components/curriculum-inventory/sequence-block-overview';

export default class CurriculumInventorySequenceBlockDetailsComponent extends Component {
  @service intl;

  @cached
  get allParentsData() {
    return new TrackedAsyncData(this.args.sequenceBlock.getAllParents(this.args.sequenceBlock));
  }

  get allParents() {
    return this.allParentsData.isResolved ? this.allParentsData.value : [];
  }

  get allParentTitles() {
    let title = this.intl.t('general.curriculumInventoryReports');

    if (this.allParents.length) {
      title = this.allParents
        .reverse()
        .reduce((str, parent) => (str += ` | ${parent.title}`), title);
    }

    title += ` | ${this.args.sequenceBlock.title}`;

    return title;
  }
  <template>
    {{#if this.allParentsData.isResolved}}
      {{pageTitle this.allParentTitles}}

      <div data-test-curriculum-inventory-sequence-block-details ...attributes>
        <SequenceBlockHeader @canUpdate={{@canUpdate}} @sequenceBlock={{@sequenceBlock}} />
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
        <SequenceBlockOverview
          @sequenceBlock={{@sequenceBlock}}
          @canUpdate={{@canUpdate}}
          @sortBy={{@sortSessionsBy}}
          @setSortBy={{@setSortSessionBy}}
        />
      </div>
    {{/if}}
  </template>
}
