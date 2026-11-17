import t from 'ember-intl/helpers/t';
import pageTitle from 'ember-page-title/helpers/page-title';
import set from 'ember-set-helper/helpers/set';
import GlobalSearch from 'frontend/components/global-search';
<template>
  {{pageTitle (t "general.search")}}
  <GlobalSearch
    @page={{@controller.page}}
    @query={{@controller.query}}
    @setQuery={{@controller.setQuery}}
    @setPage={{set @controller "page"}}
    @selectedSchools={{@controller.schoolIdsArray}}
    @setSchools={{@controller.setSchools}}
    @selectedYears={{@controller.selectedYearsArray}}
    @setYears={{@controller.setYears}}
  />
</template>
