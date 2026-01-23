import FaIcon from 'ilios-common/components/fa-icon';
import t from 'ember-intl/helpers/t';
import LmTypeIcon from 'ilios-common/components/lm-type-icon';
import { faStar } from '@fortawesome/free-solid-svg-icons';
<template>
  <span class="lm-icons" data-test-lm-icons>
    {{#if @learningMaterial.required}}
      <FaIcon
        class="required"
        @icon={{faStar}}
        @title={{t "general.required"}}
        data-test-required-icon
      />
    {{/if}}
    <LmTypeIcon @type={{@learningMaterial.type}} @mimetype={{@learningMaterial.mimetype}} />
  </span>
</template>
