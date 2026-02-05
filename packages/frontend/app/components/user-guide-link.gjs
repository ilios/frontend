import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import t from 'ember-intl/helpers/t';
import { faQuestion } from '@fortawesome/free-solid-svg-icons';
<template>
  <div class="user-guide-link" data-test-user-guide-link>
    <a
      href="https://iliosproject.gitbook.io/ilios-user-guide"
      class="font-size-small"
      target="_blank"
      title={{t "general.iliosUserGuide"}}
      rel="noopener noreferrer"
    >
      <FaIcon @icon={{faQuestion}} data-test-user-guide-link-icon />
    </a>
  </div>
</template>
