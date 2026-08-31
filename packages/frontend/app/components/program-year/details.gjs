import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';
import LeadershipExpanded from 'ilios-common/components/leadership-expanded';
import { fn } from '@ember/helper';
import LeadershipCollapsed from 'ilios-common/components/leadership-collapsed';
import hasManyLength from 'ilios-common/helpers/has-many-length';
import { eq, or } from 'ember-truth-helpers';
import Competencies from './competencies';
import CollapsedCompetencies from 'ilios-common/components/collapsed-competencies';
import Objectives from './objectives';
import CollapsedObjectives from './collapsed-objectives';
import DetailTaxonomies from 'ilios-common/components/detail-taxonomies';
import CollapsedTaxonomies from 'ilios-common/components/collapsed-taxonomies';
import CourseAssociations from './course-associations';
import CohortMembers from './cohort-members';

export default class ProgramYearDetailsComponent extends Component {
  @cached
  get schoolConfigsData() {
    return new TrackedAsyncData(this.getSchoolConfigs(this.args.programYear));
  }

  async getSchoolConfigs(programYear) {
    const program = await programYear.program;
    const school = await program.school;
    return await school.configurations;
  }

  @cached
  get schoolConfigs() {
    const rhett = new Map();
    if (this.schoolConfigsData.isResolved) {
      this.schoolConfigsData.value.forEach((config) => {
        rhett.set(config.name, config.parsedValue);
      });
    }
    return rhett;
  }

  get schoolConfigsLoaded() {
    return this.schoolConfigsData.isResolved;
  }

  get showMeSH() {
    return !!this.schoolConfigs.get('showMeSH');
  }

  <template>
    {{#if this.schoolConfigsLoaded}}
      <div class="programyear-details" data-test-program-year-details ...attributes>
        {{#if @programYearLeadershipDetails}}
          <LeadershipExpanded
            @model={{@programYear}}
            @editable={{@canUpdate}}
            @collapse={{fn @setProgramYearLeadershipDetails false}}
            @expand={{fn @setProgramYearLeadershipDetails true}}
            @isManaging={{@manageProgramYearLeadership}}
            @setIsManaging={{@setManageProgramYearLeadership}}
          />
        {{else}}
          <LeadershipCollapsed
            @showAdministrators={{false}}
            @showDirectors={{true}}
            @directorsCount={{hasManyLength @programYear "directors"}}
            @expand={{fn @setProgramYearLeadershipDetails true}}
          />
        {{/if}}
        {{#if (or (eq @programYear.competencies.length 0) @pyCompetencyDetails)}}
          <Competencies
            @programYear={{@programYear}}
            @canUpdate={{@canUpdate}}
            @isManaging={{@managePyCompetencies}}
            @collapse={{fn @setPyCompetencyDetails false}}
            @expand={{fn @setPyCompetencyDetails true}}
            @setIsManaging={{@setManagePyCompetencies}}
          />
        {{else}}
          <CollapsedCompetencies
            @subject={{@programYear}}
            @expand={{fn @setPyCompetencyDetails true}}
          />
        {{/if}}
        {{#if (or (eq @programYear.programYearObjectives.length 0) @pyObjectiveDetails)}}
          <Objectives
            @programYear={{@programYear}}
            @editable={{@canUpdate}}
            @collapse={{fn @setPyObjectiveDetails false}}
            @expand={{fn @setPyObjectiveDetails true}}
            @expandedObjectiveIds={{@expandedObjectiveIds}}
            @setExpandedObjectiveIds={{@setExpandedObjectiveIds}}
            @showMeSH={{this.showMeSH}}
          />
        {{else}}
          <CollapsedObjectives
            @programYear={{@programYear}}
            @expand={{fn @setPyObjectiveDetails true}}
            @showMeSH={{this.showMeSH}}
          />
        {{/if}}
        {{#if (or (eq @programYear.terms.length 0) @pyTaxonomyDetails)}}
          <DetailTaxonomies
            @subject={{@programYear}}
            @editable={{@canUpdate}}
            @collapse={{fn @setPyTaxonomyDetails false}}
            @expand={{fn @setPyTaxonomyDetails true}}
          />
        {{else}}
          <CollapsedTaxonomies
            @subject={{@programYear}}
            @expand={{fn @setPyTaxonomyDetails true}}
          />
        {{/if}}
        <CourseAssociations
          @programYear={{@programYear}}
          @isExpanded={{@showCourseAssociations}}
          @setIsExpanded={{@setShowCourseAssociations}}
        />
        <CohortMembers
          @programYear={{@programYear}}
          @isExpanded={{@showCohortMembers}}
          @setIsExpanded={{@setShowCohortMembers}}
        />
      </div>
    {{/if}}
  </template>
}
