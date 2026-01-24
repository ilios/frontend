import t from 'ember-intl/helpers/t';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import { faUserXmark } from '@fortawesome/free-solid-svg-icons';

<template>
  {{#unless @user.enabled}}
    <FaIcon
      @icon={{faUserXmark}}
      @title={{t "general.disabledUserAccount"}}
      class="user-status"
      data-test-user-status
    />
  {{/unless}}
</template>
