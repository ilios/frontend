import SequenceBlockDetails from 'frontend/components/curriculum-inventory/sequence-block-details';
import SequenceBlockList from 'frontend/components/curriculum-inventory/sequence-block-list';
<template>
  <SequenceBlockDetails
    @sequenceBlock={{@model}}
    @canUpdate={{@controller.canUpdate}}
    @sortSessionsBy={{@controller.sortSessionsBy}}
    @setSortSessionBy={{@controller.setSortSessionsBy}}
  />
  <SequenceBlockList
    @report={{@controller.report}}
    @parent={{@model}}
    @canUpdate={{@controller.canUpdate}}
    @sequenceBlocks={{@controller.children}}
    @remove={{@controller.removeChildSequenceBlock}}
  />
</template>
