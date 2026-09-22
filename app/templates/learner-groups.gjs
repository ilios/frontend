import pageTitle from 'ember-page-title/helpers/page-title';
import t from 'ember-intl/helpers/t';
import Root from 'frontend/components/learner-groups/root';
import set from 'ember-set-helper/helpers/set';
import perform from 'ember-concurrency/helpers/perform';
<template>
  {{pageTitle (t "general.learnerGroups")}}
  <Root
    @setSchoolId={{set @controller "school"}}
    @schoolId={{@controller.school}}
    @setProgramId={{set @controller "program"}}
    @programId={{@controller.program}}
    @setProgramYearId={{set @controller "programYear"}}
    @programYearId={{@controller.programYear}}
    @schools={{@controller.model}}
    @titleFilter={{@controller.filter}}
    @setTitleFilter={{perform @controller.setTitleFilter}}
    @sortBy={{@controller.sortBy}}
    @setSortBy={{set @controller "sortBy"}}
  />
</template>
