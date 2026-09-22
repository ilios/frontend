import SelectedInstructors from './selected-instructors';
import SelectedInstructorGroups from './selected-instructor-groups';
import t from 'ember-intl/helpers/t';
import UserSearch from './user-search';
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
