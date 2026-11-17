import t from 'ember-intl/helpers/t';
import pageTitle from 'ember-page-title/helpers/page-title';
import set from 'ember-set-helper/helpers/set';
import Root from 'frontend/components/programs/root';
<template>
  {{pageTitle (t "general.programs")}}
  <Root
    @setSchoolId={{set @controller "schoolId"}}
    @schoolId={{@controller.schoolId}}
    @schools={{@controller.model}}
  />
</template>
