import t from 'ember-intl/helpers/t';
import FaIcon from 'ilios-common/components/fa-icon';

<template>
  {{#unless @user.enabled}}
    <FaIcon
      @icon="user-xmark"
      @title={{t "general.disabledUserAccount"}}
      class="user-status font-size-small"
      data-test-user-status
    />
  {{/unless}}
</template>
