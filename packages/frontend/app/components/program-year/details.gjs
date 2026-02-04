import LeadershipExpanded from 'ilios-common/components/leadership-expanded';
import { fn } from '@ember/helper';
import LeadershipCollapsed from 'ilios-common/components/leadership-collapsed';
import hasManyLength from 'ilios-common/helpers/has-many-length';
import or from 'ember-truth-helpers/helpers/or';
import eq from 'ember-truth-helpers/helpers/eq';
import Competencies from 'frontend/components/program-year/competencies';
import CollapsedCompetencies from 'ilios-common/components/collapsed-competencies';
import Objectives from 'frontend/components/program-year/objectives';
import CollapsedObjectives from 'frontend/components/program-year/collapsed-objectives';
import DetailTaxonomies from 'ilios-common/components/detail-taxonomies';
import CollapsedTaxonomies from 'ilios-common/components/collapsed-taxonomies';
import CourseAssociations from 'frontend/components/program-year/course-associations';
import CohortMembers from 'frontend/components/program-year/cohort-members';

<template>
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
      />
    {{else}}
      <CollapsedObjectives
        @programYear={{@programYear}}
        @expand={{fn @setPyObjectiveDetails true}}
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
      <CollapsedTaxonomies @subject={{@programYear}} @expand={{fn @setPyTaxonomyDetails true}} />
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
</template>
