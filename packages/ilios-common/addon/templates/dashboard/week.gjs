import pageTitle from 'ember-page-title/helpers/page-title';
import t from 'ember-intl/helpers/t';
import Navigation from 'ilios-common/components/dashboard/navigation';
import Week from 'ilios-common/components/dashboard/week';
<template>
  {{pageTitle " | " (t "general.weekAtAGlance") prepend=false}}
  <Navigation />
  <Week />
</template>
