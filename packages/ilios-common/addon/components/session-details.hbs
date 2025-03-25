<div class="back-to-session" {{scroll-into-view}}>
  <LinkTo @route="course" @model={{@session.course}} data-test-back-to-sessions>
    {{t "general.backToSessionList"}}
  </LinkTo>
</div>

<section class="session-details" data-test-session-details>
  <Session::Overview @session={{@session}} @editable={{@editable}} />
  {{#if @sessionLeadershipDetails}}
    <LeadershipExpanded
      @model={{@session}}
      @editable={{@editable}}
      @collapse={{fn @setSessionLeadershipDetails false}}
      @expand={{fn @setSessionLeadershipDetails true}}
      @isManaging={{@sessionManageLeadership}}
      @setIsManaging={{@setSessionManageLeadership}}
    />
  {{else}}
    <LeadershipCollapsed
      @showDirectors={{false}}
      @showAdministrators={{true}}
      @showStudentAdvisors={{true}}
      @administratorsCount={{has-many-length @session "administrators"}}
      @studentAdvisorsCount={{has-many-length @session "studentAdvisors"}}
      @expand={{fn @setSessionLeadershipDetails true}}
    />
  {{/if}}
  {{#if @session.isIndependentLearning}}
    <DetailLearnersAndLearnerGroups
      @session={{@session}}
      @editable={{@editable}}
      @cohorts={{this.cohorts}}
    />
    <DetailInstructors @session={{@session}} @editable={{@editable}} />
  {{/if}}
  {{#if (or (eq @session.sessionObjectives.length 0) @sessionObjectiveDetails)}}
    <Session::Objectives
      @session={{@session}}
      @editable={{@editable}}
      @collapse={{fn @setSessionObjectiveDetails false}}
      @expand={{fn @setSessionObjectiveDetails true}}
    />
  {{else}}
    <Session::CollapsedObjectives
      @session={{@session}}
      @editable={{@editable}}
      @expand={{fn @setSessionObjectiveDetails true}}
    />
  {{/if}}
  <DetailLearningMaterials @subject={{@session}} @isCourse={{false}} @editable={{@editable}} />
  {{#if (or (eq @session.terms.length 0) @sessionTaxonomyDetails)}}
    <DetailTaxonomies
      @subject={{@session}}
      @editable={{@editable}}
      @collapse={{fn @setSessionTaxonomyDetails false}}
      @expand={{fn @setSessionTaxonomyDetails true}}
    />
  {{else}}
    <CollapsedTaxonomies @subject={{@session}} @expand={{fn @setSessionTaxonomyDetails true}} />
  {{/if}}
  <DetailMesh @subject={{@session}} @isSession={{true}} @editable={{@editable}} />
  <SessionOfferings
    @session={{@session}}
    @editable={{@editable}}
    @showNewOfferingForm={{@showNewOfferingForm}}
    @toggleShowNewOfferingForm={{@toggleShowNewOfferingForm}}
  />
</section>