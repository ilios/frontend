import Component from '@glimmer/component';
import { service } from '@ember/service';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';
import scrollIntoView from 'ilios-common/modifiers/scroll-into-view';
import { LinkTo } from '@ember/routing';
import t from 'ember-intl/helpers/t';
import Overview from 'ilios-common/components/session/overview';
import LeadershipExpanded from 'ilios-common/components/leadership-expanded';
import { fn } from '@ember/helper';
import LeadershipCollapsed from 'ilios-common/components/leadership-collapsed';
import hasManyLength from 'ilios-common/helpers/has-many-length';
import DetailLearnersAndLearnerGroups from 'ilios-common/components/detail-learners-and-learner-groups';
import DetailInstructors from 'ilios-common/components/detail-instructors';
import { eq, or } from 'ember-truth-helpers';
import Objectives from 'ilios-common/components/session/objectives';
import CollapsedObjectives from 'ilios-common/components/session/collapsed-objectives';
import DetailLearningMaterials from 'ilios-common/components/detail-learning-materials';
import DetailTaxonomies from 'ilios-common/components/detail-taxonomies';
import CollapsedTaxonomies from 'ilios-common/components/collapsed-taxonomies';
import DetailMesh from 'ilios-common/components/detail-mesh';
import SessionOfferings from 'ilios-common/components/session-offerings';
import { pageTitle } from 'ember-page-title';

export default class SessionDetailsComponent extends Component {
  @service schoolConfig;

  @cached
  get courseData() {
    return new TrackedAsyncData(this.args.session.course);
  }

  @cached
  get cohortsData() {
    return new TrackedAsyncData(this.course?.cohorts);
  }

  get course() {
    return this.courseData.isResolved ? this.courseData.value : null;
  }

  get cohorts() {
    return this.cohortsData.isResolved ? this.cohortsData.value : null;
  }

  get showMeSH() {
    return this.schoolConfig.getShowMeSH(this.course?.belongsTo('school').id());
  }

  get showAttendanceRequired() {
    return this.schoolConfig.getShowSessionAttendanceRequired(
      this.course?.belongsTo('school').id(),
    );
  }

  get showSupplemental() {
    return this.schoolConfig.getShowSessionSupplemental(this.course?.belongsTo('school').id());
  }

  get showSpecialAttireRequired() {
    return this.schoolConfig.getShowSessionSpecialAttireRequired(
      this.course?.belongsTo('school').id(),
    );
  }

  get showSpecialEquipmentRequired() {
    return this.schoolConfig.getShowSessionSpecialEquipmentRequired(
      this.course?.belongsTo('school').id(),
    );
  }

  get accessibilityRequired() {
    return this.schoolConfig.getLearningMaterialAccessibilityRequired(
      this.course?.belongsTo('school').id(),
    );
  }

  get accessibilityRequirementsLink() {
    return this.schoolConfig.getLearningMaterialAccessibilityRequirementsLink(
      this.course?.belongsTo('school').id(),
    );
  }

  <template>
    {{pageTitle " | Session: " @session.title}}
    <div class="back-to-session" {{scrollIntoView delay=10}}>
      <LinkTo @route="course" @model={{@session.course}} data-test-back-to-sessions>
        {{t "general.backToSessionList"}}
      </LinkTo>
    </div>

    <section class="session-details" data-test-session-details>
      <Overview
        @session={{@session}}
        @editable={{@editable}}
        @showSpecialEquipmentRequired={{this.showSpecialEquipmentRequired}}
        @showSpecialAttireRequired={{this.showSpecialAttireRequired}}
        @showSupplemental={{this.showSupplemental}}
        @showAttendanceRequired={{this.showAttendanceRequired}}
      />
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
          @administratorsCount={{hasManyLength @session "administrators"}}
          @studentAdvisorsCount={{hasManyLength @session "studentAdvisors"}}
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
        <Objectives
          @session={{@session}}
          @editable={{@editable}}
          @collapse={{fn @setSessionObjectiveDetails false}}
          @expand={{fn @setSessionObjectiveDetails true}}
          @showMeSH={{this.showMeSH}}
        />
      {{else}}
        <CollapsedObjectives
          @session={{@session}}
          @editable={{@editable}}
          @expand={{fn @setSessionObjectiveDetails true}}
          @showMeSH={{this.showMeSH}}
        />
      {{/if}}
      <DetailLearningMaterials
        @subject={{@session}}
        @isCourse={{false}}
        @editable={{@editable}}
        @showMeSH={{this.showMeSH}}
        @accessibilityRequired={{this.accessibilityRequired}}
        @accessibilityRequirementsLink={{this.accessibilityRequirementsLink}}
      />
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
      {{#if this.showMeSH}}
        <DetailMesh @subject={{@session}} @isSession={{true}} @editable={{@editable}} />
      {{/if}}
      <SessionOfferings
        @session={{@session}}
        @editable={{@editable}}
        @showNewOfferingForm={{@showNewOfferingForm}}
        @toggleShowNewOfferingForm={{@toggleShowNewOfferingForm}}
      />
    </section>
  </template>
}
