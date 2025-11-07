import Header from 'frontend/components/program-year/header';
import Overview from 'frontend/components/program-year/overview';
import Details from 'frontend/components/program-year/details';
import set from 'ember-set-helper/helpers/set';
<template>
  <Header @programYear={{@model}} />
  <Overview @programYear={{@model}} @canUpdate={{@controller.canUpdate}} />
  <Details
    @program={{@controller.program}}
    @canUpdate={{@controller.canUpdate}}
    @programYear={{@model}}
    @pyObjectiveDetails={{@controller.pyObjectiveDetails}}
    @pyTaxonomyDetails={{@controller.pyTaxonomyDetails}}
    @pyCompetencyDetails={{@controller.pyCompetencyDetails}}
    @managePyCompetencies={{@controller.managePyCompetencies}}
    @setPyObjectiveDetails={{set @controller "pyObjectiveDetails"}}
    @setPyTaxonomyDetails={{set @controller "pyTaxonomyDetails"}}
    @setPyCompetencyDetails={{set @controller "pyCompetencyDetails"}}
    @setManagePyCompetencies={{set @controller "managePyCompetencies"}}
    @programYearLeadershipDetails={{@controller.pyLeadershipDetails}}
    @setProgramYearLeadershipDetails={{set @controller "pyLeadershipDetails"}}
    @manageProgramYearLeadership={{@controller.managePyLeadership}}
    @setManageProgramYearLeadership={{set @controller "managePyLeadership"}}
    @showCourseAssociations={{@controller.showCourseAssociations}}
    @setShowCourseAssociations={{set @controller "showCourseAssociations"}}
    @expandedObjectiveIds={{@controller.expandedObjectiveIds}}
    @setExpandedObjectiveIds={{@controller.setExpandedObjectiveIds}}
  />
</template>
