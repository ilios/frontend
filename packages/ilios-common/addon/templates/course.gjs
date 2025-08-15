import Loader from 'ilios-common/components/course/loader';
import set from 'ember-set-helper/helpers/set';
<template>
  <Loader
    @course={{@model}}
    @editable={{@controller.editable}}
    @showDetails={{@controller.details}}
    @setShowDetails={{set @controller "details"}}
    @courseLeadershipDetails={{@controller.courseLeadershipDetails}}
    @courseObjectiveDetails={{@controller.courseObjectiveDetails}}
    @courseTaxonomyDetails={{@controller.courseTaxonomyDetails}}
    @courseCompetencyDetails={{@controller.courseCompetencyDetails}}
    @courseManageLeadership={{@controller.courseManageLeadership}}
    @setCourseLeadershipDetails={{set @controller "courseLeadershipDetails"}}
    @setCourseObjectiveDetails={{set @controller "courseObjectiveDetails"}}
    @setCourseTaxonomyDetails={{set @controller "courseTaxonomyDetails"}}
    @setCourseCompetencyDetails={{set @controller "courseCompetencyDetails"}}
    @setCourseManageLeadership={{set @controller "courseManageLeadership"}}
  />

  {{outlet}}
</template>
