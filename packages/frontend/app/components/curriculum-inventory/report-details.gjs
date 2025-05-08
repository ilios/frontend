<div
  class="curriculum-inventory-report-details"
  data-test-curriculum-inventory-report-details
  ...attributes
>
  <CurriculumInventory::ReportHeader
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
  <CurriculumInventory::ReportOverview @report={{@report}} @canUpdate={{this.canUpdate}} />
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
      @administratorsCount={{has-many-length @report "administrators"}}
      @expand={{fn @setLeadershipDetails true}}
    />
  {{/if}}
</div>