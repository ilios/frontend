import LeadershipExpanded from '../leadership-expanded';
import { fn, get } from '@ember/helper';
import LeadershipCollapsed from '../leadership-collapsed';
import hasManyLength from '../../helpers/has-many-length';
import { eq, not, or } from 'ember-truth-helpers';
import Objectives from './objectives';
import CollapsedObjectives from './collapsed-objectives';
import DetailLearningMaterials from '../detail-learning-materials';
import DetailCompetencies from '../detail-competencies';
import CollapsedCompetencies from '../collapsed-competencies';
import DetailTaxonomies from '../detail-taxonomies';
import CollapsedTaxonomies from '../collapsed-taxonomies';
import DetailMesh from '../detail-mesh';
import DetailCohorts from '../detail-cohorts';
<template>
  <div>
    {{#if @courseLeadershipDetails}}
      <LeadershipExpanded
        @model={{@course}}
        @editable={{@editable}}
        @collapse={{fn @setCourseLeadershipDetails false}}
        @expand={{fn @setCourseLeadershipDetails true}}
        @isManaging={{@courseManageLeadership}}
        @setIsManaging={{@setCourseManageLeadership}}
      />
    {{else}}
      <LeadershipCollapsed
        @directorsCount={{hasManyLength @course "directors"}}
        @administratorsCount={{hasManyLength @course "administrators"}}
        @studentAdvisorsCount={{hasManyLength @course "studentAdvisors"}}
        @expand={{fn @setCourseLeadershipDetails true}}
        @showAdministrators={{true}}
        @showDirectors={{true}}
        @showStudentAdvisors={{true}}
      />
    {{/if}}
    {{#if (or (not (hasManyLength @course "courseObjectives")) @courseObjectiveDetails)}}
      <Objectives
        @course={{@course}}
        @editable={{@editable}}
        @collapse={{fn @setCourseObjectiveDetails false}}
        @expand={{fn @setCourseObjectiveDetails true}}
        @showMeSH={{@showMeSH}}
        @allowMultipleCourseObjectiveParents={{@allowMultipleCourseObjectiveParents}}
      />
    {{else}}
      <CollapsedObjectives
        @course={{@course}}
        @expand={{fn @setCourseObjectiveDetails true}}
        @showMeSH={{@showMeSH}}
      />
    {{/if}}
    <DetailLearningMaterials
      @subject={{@course}}
      @isCourse={{true}}
      @editable={{@editable}}
      @accessibilityRequired={{@accessibilityRequired}}
      @accessibilityRequirementsLink={{@accessibilityRequirementsLink}}
      @showMeSH={{@showMeSH}}
    />
    {{#if (or (eq (get @course.competencies "length") 0) @courseCompetencyDetails)}}
      <DetailCompetencies
        @course={{@course}}
        @editable={{@editable}}
        @collapse={{fn @setCourseCompetencyDetails false}}
        @expand={{fn @setCourseCompetencyDetails true}}
      />
    {{else}}
      <CollapsedCompetencies @subject={{@course}} @expand={{fn @setCourseCompetencyDetails true}} />
    {{/if}}
    {{#if (or (eq @course.terms.length 0) @courseTaxonomyDetails)}}
      <DetailTaxonomies
        @subject={{@course}}
        @isCourse={{true}}
        @editable={{@editable}}
        @collapse={{fn @setCourseTaxonomyDetails false}}
        @expand={{fn @setCourseTaxonomyDetails true}}
      />
    {{else}}
      <CollapsedTaxonomies @subject={{@course}} @expand={{fn @setCourseTaxonomyDetails true}} />
    {{/if}}
    {{#if @showMeSH}}
      <DetailMesh @subject={{@course}} @isCourse={{true}} @editable={{@editable}} />
    {{/if}}
    <DetailCohorts @course={{@course}} @editable={{@editable}} />
  </div>
</template>
