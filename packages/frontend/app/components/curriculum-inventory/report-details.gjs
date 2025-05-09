import Component from '@glimmer/component';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { dropTask } from 'ember-concurrency';
import ReportHeader from 'frontend/components/curriculum-inventory/report-header';
import set from 'ember-set-helper/helpers/set';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import perform from 'ember-concurrency/helpers/perform';
import ReportOverview from 'frontend/components/curriculum-inventory/report-overview';
import LeadershipExpanded from 'ilios-common/components/leadership-expanded';
import { fn } from '@ember/helper';
import LeadershipCollapsed from 'ilios-common/components/leadership-collapsed';
import hasManyLength from 'ilios-common/helpers/has-many-length';

export default class CurriculumInventoryReportDetailsComponent extends Component {
  @service store;
  @tracked showFinalizeConfirmation = false;

  get isFinalizing() {
    return this.finalize.isRunning;
  }

  get canUpdate() {
    return this.args.canUpdate && !this.isFinalizing;
  }

  finalize = dropTask(async () => {
    const newExport = this.store.createRecord('curriculum-inventory-export', {
      report: this.args.report,
    });
    this.showFinalizeConfirmation = false;
    const savedExport = await newExport.save();
    this.args.report.set('export', savedExport);
    this.args.setIsFinalized(true);
  });
  <template>
    <div
      class="curriculum-inventory-report-details"
      data-test-curriculum-inventory-report-details
      ...attributes
    >
      <ReportHeader
        @report={{@report}}
        @finalize={{set this "showFinalizeConfirmation" true}}
        @canUpdate={{this.canUpdate}}
        @isFinalizing={{this.isFinalizing}}
      />
      {{#if this.showFinalizeConfirmation}}
        <div class="confirm-finalize" data-test-confirm-finalize>
          <div class="confirm-message" data-test-message>
            {{t "general.finalizeReportConfirmation"}}
            <br />
            <div class="confirm-buttons">
              <button
                type="button"
                class="finalize text"
                {{on "click" (perform this.finalize)}}
                data-test-finalize
              >
                {{t "general.yes"}}
              </button>
              <button
                type="button"
                class="done text"
                {{on "click" (set this "showFinalizeConfirmation" false)}}
                data-test-cancel
              >
                {{t "general.cancel"}}
              </button>
            </div>
          </div>
        </div>
      {{/if}}
      <ReportOverview @report={{@report}} @canUpdate={{this.canUpdate}} />
      {{#if @leadershipDetails}}
        <LeadershipExpanded
          @model={{@report}}
          @editable={{this.canUpdate}}
          @collapse={{fn @setLeadershipDetails false}}
          @expand={{fn @setLeadershipDetails true}}
          @isManaging={{@manageLeadership}}
          @setIsManaging={{@setManageLeadership}}
        />
      {{else}}
        <LeadershipCollapsed
          @showAdministrators={{true}}
          @showDirectors={{false}}
          @administratorsCount={{hasManyLength @report "administrators"}}
          @expand={{fn @setLeadershipDetails true}}
        />
      {{/if}}
    </div>
  </template>
}
