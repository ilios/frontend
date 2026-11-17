import { fn } from '@ember/helper';
import { eq, or } from 'ember-truth-helpers';

import hasManyLength from '../../helpers/has-many-length';
import CollapsedCompetencies from '../collapsed-competencies';
import CollapsedTaxonomies from '../collapsed-taxonomies';
import DetailTaxonomies from '../detail-taxonomies';
import LeadershipCollapsed from '../leadership-collapsed';
import LeadershipExpanded from '../leadership-expanded';
import CohortMembers from './cohort-members';
import CollapsedObjectives from './collapsed-objectives';
import Competencies from './competencies';
import CourseAssociations from './course-associations';
import Objectives from './objectives';

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
        @showMeSH={{@showMeSH}}
      />
    {{else}}
      <CollapsedObjectives
        @programYear={{@programYear}}
        @expand={{fn @setPyObjectiveDetails true}}
        @showMeSH={{@showMeSH}}
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
