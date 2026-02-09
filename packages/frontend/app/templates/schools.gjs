import pageTitle from 'ember-page-title/helpers/page-title';
import t from 'ember-intl/helpers/t';
import List from 'frontend/components/schools/list';
<template>
  {{pageTitle (t "general.schools")}}
  <List @schools={{@model}} />
</template>
