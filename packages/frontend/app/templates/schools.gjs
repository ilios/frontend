import pageTitle from 'ember-page-title/helpers/page-title';
import t from 'ember-intl/helpers/t';
import SchoolList from 'frontend/components/school-list';
<template>
  {{pageTitle (t "general.schools")}}
  <SchoolList @schools={{@model}} />
</template>
