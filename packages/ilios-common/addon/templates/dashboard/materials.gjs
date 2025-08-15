import pageTitle from 'ember-page-title/helpers/page-title';
import t from 'ember-intl/helpers/t';
import Navigation from 'ilios-common/components/dashboard/navigation';
import Materials from 'ilios-common/components/dashboard/materials';
<template>
  {{pageTitle " | " (t "general.myMaterials") prepend=false}}
  <Navigation />
  <Materials
    @courseIdFilter={{@controller.course}}
    @filter={{@controller.filter}}
    @sortBy={{@controller.sortBy}}
    @offset={{@controller.offset}}
    @setOffset={{@controller.setOffset}}
    @limit={{@controller.limit}}
    @setLimit={{@controller.setLimit}}
    @setCourseIdFilter={{@controller.setCourse}}
    @setFilter={{@controller.setFilter}}
    @setSortBy={{@controller.setSortBy}}
    @toggleMaterialsMode={{@controller.toggleMaterialsMode}}
    @showAllMaterials={{@controller.showAllMaterials}}
  />
</template>
