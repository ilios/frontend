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
      @directorsCount={{has-many-length @course "directors"}}
      @administratorsCount={{has-many-length @course "administrators"}}
      @studentAdvisorsCount={{has-many-length @course "studentAdvisors"}}
      @expand={{fn @setCourseLeadershipDetails true}}
      @showAdministrators={{true}}
      @showDirectors={{true}}
      @showStudentAdvisors={{true}}
    />
  {{/if}}
  {{#if (or (not (has-many-length @course "courseObjectives")) @courseObjectiveDetails)}}
    <Course::Objectives
      @course={{@course}}
      @editable={{@editable}}
      @collapse={{fn @setCourseObjectiveDetails false}}
      @expand={{fn @setCourseObjectiveDetails true}}
    />
  {{else}}
    <Course::CollapsedObjectives
      @course={{@course}}
      @expand={{fn @setCourseObjectiveDetails true}}
    />
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