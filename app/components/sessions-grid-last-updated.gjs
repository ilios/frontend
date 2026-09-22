import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import t from 'ember-intl/helpers/t';
import formatDate from 'ember-intl/helpers/format-date';
import { faClockRotateLeft } from '@fortawesome/free-solid-svg-icons';
<template>
  <div class="sessions-grid-last-updated">
    <FaIcon @icon={{faClockRotateLeft}} @title={{t "general.lastUpdate"}} />
    {{t "general.lastUpdate"}}:
    {{formatDate
      @session.updatedAt
      month="2-digit"
      day="2-digit"
      year="numeric"
      hour="2-digit"
      minute="2-digit"
    }}
  </div>
</template>
