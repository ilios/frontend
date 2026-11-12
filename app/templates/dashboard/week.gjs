import t from 'ember-intl/helpers/t';
import pageTitle from 'ember-page-title/helpers/page-title';

import Navigation from '../../components/dashboard/navigation';
import Week from '../../components/dashboard/week';
<template>
  {{pageTitle " | " (t "general.weekAtAGlance") prepend=false}}
  <Navigation />
  <Week />
</template>
