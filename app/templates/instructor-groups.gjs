import perform from 'ember-concurrency/helpers/perform';
import t from 'ember-intl/helpers/t';
import pageTitle from 'ember-page-title/helpers/page-title';
import set from 'ember-set-helper/helpers/set';
import Root from 'frontend/components/instructor-groups/root';
<template>
  {{pageTitle (t "general.instructorGroups")}}
  <Root
    @setTitleFilter={{perform @controller.changeTitleFilter}}
    @titleFilter={{@controller.titleFilter}}
    @setSchoolId={{set @controller "schoolId"}}
    @schoolId={{@controller.schoolId}}
    @schools={{@controller.model}}
    @sortBy={{@controller.sortBy}}
    @setSortBy={{set @controller "sortBy"}}
  />
</template>
