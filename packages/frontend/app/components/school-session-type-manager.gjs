<div class="school-session-type-manager" data-test-school-session-type-manager ...attributes>
  <div class="session-type-title" data-test-school-session-type-manager-title>
    {{@sessionType.title}}
  </div>
  <SchoolSessionTypeForm
    @title={{this.readonlySessionType.title}}
    @calendarColor={{this.readonlySessionType.calendarColor}}
    @assessment={{this.readonlySessionType.assessment}}
    @isActive={{this.readonlySessionType.isActive}}
    @selectedAssessmentOptionId={{this.readonlySessionType.selectedAssessmentOptionId}}
    @selectedAamcMethodId={{this.readonlySessionType.selectedAamcMethodId}}
    @canEditTitle={{and @canUpdate (eq @sessionType.sessionCount 0)}}
    @canEditAamcMethod={{@canUpdate}}
    @canEditCalendarColor={{@canUpdate}}
    @canEditAssessment={{and @canUpdate (eq @sessionType.sessionCount 0)}}
    @canEditAssessmentOption={{and @canUpdate (eq @sessionType.sessionCount 0)}}
    @canEditActive={{@canUpdate}}
    @canUpdate={{@canUpdate}}
    @save={{@save}}
    @close={{@close}}
  />
</div>