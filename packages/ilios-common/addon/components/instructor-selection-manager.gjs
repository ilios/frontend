import SelectedInstructors from 'ilios-common/components/selected-instructors';
import SelectedInstructorGroups from 'ilios-common/components/selected-instructor-groups';
import t from 'ember-intl/helpers/t';
import UserSearch from 'ilios-common/components/user-search';
<template>
  <section class="instructor-selection-manager" data-test-instructor-selection-manager>
    <SelectedInstructors
      @instructors={{@instructors}}
      @isManaging={{true}}
      @showDefaultNotLoaded={{@showDefaultNotLoaded}}
      @remove={{@removeInstructor}}
    />
    <SelectedInstructorGroups
      @instructorGroups={{@instructorGroups}}
      @isManaging={{true}}
      @showDefaultNotLoaded={{@showDefaultNotLoaded}}
      @remove={{@removeInstructorGroup}}
    />
    <div class="available-instructors" data-test-available-instructors>
      <label>{{t "general.availableInstructorsAndInstructorGroups"}}:</label>
      <UserSearch
        @addUser={{@addInstructor}}
        @addInstructorGroup={{@addInstructorGroup}}
        @currentlyActiveUsers={{@instructors}}
        @placeholder={{t "general.findInstructorOrGroup"}}
        @availableInstructorGroups={{@availableInstructorGroups}}
        @currentlyActiveInstructorGroups={{@instructorGroups}}
      />
    </div>
  </section>
</template>
