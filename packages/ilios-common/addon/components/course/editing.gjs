import LeadershipExpanded from 'ilios-common/components/leadership-expanded';
import { fn, get } from '@ember/helper';
import LeadershipCollapsed from 'ilios-common/components/leadership-collapsed';
import hasManyLength from 'ilios-common/helpers/has-many-length';
import or from 'ember-truth-helpers/helpers/or';
import not from 'ember-truth-helpers/helpers/not';
import Objectives from 'ilios-common/components/course/objectives';
import CollapsedObjectives from 'ilios-common/components/course/collapsed-objectives';
import DetailLearningMaterials from 'ilios-common/components/detail-learning-materials';
import eq from 'ember-truth-helpers/helpers/eq';
import DetailCompetencies from 'ilios-common/components/detail-competencies';
import CollapsedCompetencies from 'ilios-common/components/collapsed-competencies';
import DetailTaxonomies from 'ilios-common/components/detail-taxonomies';
import CollapsedTaxonomies from 'ilios-common/components/collapsed-taxonomies';
import DetailMesh from 'ilios-common/components/detail-mesh';
import DetailCohorts from 'ilios-common/components/detail-cohorts';
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
      />
    {{else}}
      <CollapsedObjectives @course={{@course}} @expand={{fn @setCourseObjectiveDetails true}} />
    {{/if}}
    <DetailLearningMaterials @subject={{@course}} @isCourse={{true}} @editable={{@editable}} />
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
    <DetailMesh @subject={{@course}} @isCourse={{true}} @editable={{@editable}} />
    <DetailCohorts @course={{@course}} @editable={{@editable}} />
  </div>
</template>
