import t from 'ember-intl/helpers/t';
import pageTitle from 'ember-page-title/helpers/page-title';
import Loading from 'frontend/components/courses/loading';
<template>
  {{pageTitle (t "general.courses")}}
  <Loading />
</template>
