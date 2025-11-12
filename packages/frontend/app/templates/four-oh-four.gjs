import pageTitle from 'ember-page-title/helpers/page-title';
import t from 'ember-intl/helpers/t';
import NotFound from 'ilios-common/components/not-found';
<template>
  {{pageTitle (t "general.notFound")}}
  <div class="full-screen-error main-section">
    <NotFound />
  </div>
</template>
