import FaIcon from 'ilios-common/components/fa-icon';
import t from 'ember-intl/helpers/t';
<template>
  <div class="user-guide-link" data-test-user-guide-link>
    <a
      href="https://iliosproject.gitbook.io/ilios-user-guide"
      target="_blank"
      aria-labelledby="user-guide-link-icon"
      rel="noopener noreferrer"
    >
      <FaIcon
        @icon="question"
        @title={{t "general.iliosUserGuide"}}
        id="user-guide-link-icon"
        data-test-user-guide-link-icon
      />
    </a>
  </div>
</template>
