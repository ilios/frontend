import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { service } from '@ember/service';
import { TrackedAsyncData } from 'ember-async-data';
import SequenceBlockHeader from './sequence-block-header';
import { LinkTo } from '@ember/routing';
import t from 'ember-intl/helpers/t';
import reverse from 'ilios-common/helpers/reverse';
import { pageTitle } from 'ember-page-title';
import Breadcrumbs from 'ilios-common/components/breadcrumbs';
import SequenceBlockOverview from './sequence-block-overview';

export default class CurriculumInventorySequenceBlockDetailsComponent extends Component {
  @service intl;

  @cached
  get allParentsData() {
    return new TrackedAsyncData(this.args.sequenceBlock.getAllParents(this.args.sequenceBlock));
  }

  get allParents() {
    return this.allParentsData.isResolved ? this.allParentsData.value : [];
  }

  get associatedReportTitle() {
    return this.args.sequenceBlock.report.content.name;
  }

  paths = [
    {
      route: 'curriculum-inventory-report',
      title: this.intl.t('general.curriculumInventoryReport'),
    },
  ];

  <template>
    {{pageTitle
      (t "general.curriculumInventoryReports")
      " | "
      this.associatedReportTitle
      prepend=false
    }}
    {{#if this.allParents.length}}
      {{#each this.allParents as |parent|}}
        {{pageTitle " | " parent.title prepend=true}}
      {{/each}}
    {{/if}}
    {{pageTitle " | " @sequenceBlock.title prepend=true}}

    <div data-test-curriculum-inventory-sequence-block-details ...attributes>
      <SequenceBlockHeader @canUpdate={{@canUpdate}} @sequenceBlock={{@sequenceBlock}} />

      <Breadcrumbs
        @paths={{this.paths}}
        @model={{@sequenceBlock.report}}
        @rootTitle={{@sequenceBlock.title}}
        as |path model|
      >
        <LinkTo @route={{path.route}} @model={{model}} class="crumb" data-test-crumb>
          {{path.title}}
        </LinkTo>
        {{#each (reverse this.allParents) as |parent|}}
          <LinkTo
            @route="curriculum-inventory-sequence-block"
            @model={{parent}}
            class="crumb"
            data-test-crumb
          >
            {{parent.title}}
          </LinkTo>
        {{/each}}
      </Breadcrumbs>

      <SequenceBlockOverview
        @sequenceBlock={{@sequenceBlock}}
        @canUpdate={{@canUpdate}}
        @sortBy={{@sortSessionsBy}}
        @setSortBy={{@setSortSessionBy}}
      />
    </div>
  </template>
}
