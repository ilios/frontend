import BackToCourses from 'ilios-common/components/course/back-to-courses';
import animateLoading from 'ilios-common/modifiers/animate-loading';
import t from 'ember-intl/helpers/t';
import FaIcon from 'ilios-common/components/fa-icon';
<template>
  <BackToCourses />

  <div aria-hidden="true">
    <div class="course-loading" {{animateLoading "course" loadingTime=10000 finalOpacity=".5"}}>
      <div class="header">
        <span class="title">&nbsp;</span>
      </div>
      <div class="overview">
        <div class="course-overview-header">
          <div class="title">
            {{t "general.overview"}}
          </div>
          <div class="course-overview-actions"></div>
        </div>
        <div class="course-overview-content">
          <div class="block">
            <label>{{t "general.externalId"}}:</label>
          </div>
          <div class="block">
            <label>{{t "general.clerkshipType"}}:</label>
          </div>
          <div class="block">
            <label>{{t "general.start"}}:</label>
          </div>
          <div class="block">
            <label>{{t "general.end"}}:</label>
          </div>
          <div class="block">
            <label>{{t "general.level"}}:</label>
          </div>
          <div class="block">
            <label>{{t "general.universalLocator"}}:</label>
          </div>
        </div>
      </div>
      <div class="mock-detail-box">
        <span>
          {{t "general.expandDetail"}}
          <FaIcon @icon="square-plus" class="expand-collapse-icon" />
        </span>
      </div>
    </div>

    <section
      class="course-sessions course-sessions-loading"
      {{animateLoading "course-sessions" finalOpacity=".5"}}
    >
      <div class="course-sessions-header">
        {{! template-lint-disable no-bare-strings }}
        <div class="title">
          {{t "general.sessions"}}
          (xx)
        </div>
        <div class="actions"></div>
      </div>
      <div class="filter">
        {{! template-lint-disable require-input-label }}
        <input disabled />
      </div>
      <section>
        <div class="sessions-grid-header"></div>
      </section>
    </section>
  </div>
</template>
