<div class="new-offering">
  <div class="new-offering-title" {{scroll-into-view}}>
    {{t "general.newOffering"}}
  </div>
  <div class="choose-offering-type">
    <ClickChoiceButtons
      @buttonContent1={{t "general.smallGroups"}}
      @buttonContent2={{t "general.offering"}}
      @firstChoicePicked={{this.smallGroupMode}}
      @toggle={{set this "smallGroupMode"}}
    />
  </div>
  <OfferingForm
    @showRoom={{not this.smallGroupMode}}
    @showMakeRecurring={{true}}
    @showInstructors={{not this.smallGroupMode}}
    @cohorts={{@cohorts}}
    @courseStartDate={{@courseStartDate}}
    @courseEndDate={{@courseEndDate}}
    @close={{@close}}
    @save={{this.save}}
    @smallGroupMode={{this.smallGroupMode}}
    @session={{@session}}
  />
</div>