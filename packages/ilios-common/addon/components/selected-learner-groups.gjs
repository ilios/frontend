import t from 'ember-intl/helpers/t';
import DetailLearnergroupsList from 'ilios-common/components/detail-learnergroups-list';
<template>
  <div class="selected-learner-groups" data-test-selected-learner-groups ...attributes>
    <label data-test-heading>{{t "general.selectedLearnerGroups"}}:</label>
    {{#if @learnerGroups.length}}
      <DetailLearnergroupsList
        @learnerGroups={{@learnerGroups}}
        @isManaging={{@isManaging}}
        @remove={{@remove}}
      />
    {{else}}
      <div data-test-no-selected-learner-groups>
        {{t "general.none"}}
      </div>
    {{/if}}
  </div>
</template>
