import { fn } from '@ember/helper';
import { LinkTo } from '@ember/routing';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';
import t from 'ember-intl/helpers/t';
import { pageTitle } from 'ember-page-title';
import { eq, or } from 'ember-truth-helpers';

import hasManyLength from '../helpers/has-many-length';
import scrollIntoView from '../modifiers/scroll-into-view';
import CollapsedTaxonomies from './collapsed-taxonomies';
import DetailInstructors from './detail-instructors';
import DetailLearnersAndLearnerGroups from './detail-learners-and-learner-groups';
import DetailLearningMaterials from './detail-learning-materials';
import DetailMesh from './detail-mesh';
import DetailTaxonomies from './detail-taxonomies';
import LeadershipCollapsed from './leadership-collapsed';
import LeadershipExpanded from './leadership-expanded';
import CollapsedObjectives from './session/collapsed-objectives';
import Objectives from './session/objectives';
import Overview from './session/overview';
import SessionOfferings from './session-offerings';

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
