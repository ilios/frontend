import pageTitle from 'ember-page-title/helpers/page-title';
import t from 'ember-intl/helpers/t';
import Root from 'frontend/components/schools/root';
<template>
  {{pageTitle (t "general.schools")}}
  <Root @schools={{@model}} />
</template>
