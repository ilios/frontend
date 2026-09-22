import pageTitle from 'ember-page-title/helpers/page-title';
import t from 'ember-intl/helpers/t';
import Root from 'frontend/components/courses/root';
import set from 'ember-set-helper/helpers/set';
import { fn } from '@ember/helper';
import perform from 'ember-concurrency/helpers/perform';
import { not } from 'ember-truth-helpers';
<template>
  {{pageTitle (t "general.courses")}}
  <Root
    @schools={{@model.schools}}
    @primarySchool={{@model.primarySchool}}
    @years={{@model.years}}
    @year={{@controller.year}}
    @changeSelectedYear={{set @controller "year"}}
    @schoolId={{@controller.schoolId}}
    @changeSelectedSchool={{set @controller "schoolId"}}
    @sortCoursesBy={{@controller.sortCoursesBy}}
    @setSortCoursesBy={{set @controller "sortCoursesBy"}}
    @titleFilter={{@controller.titleFilter}}
    @changeTitleFilter={{fn (perform @controller.changeTitleFilter)}}
    @userCoursesOnly={{@controller.userCoursesOnly}}
    @toggleUserCoursesOnly={{fn
      (set @controller "userCoursesOnly")
      (not @controller.userCoursesOnly)
    }}
  />
</template>
