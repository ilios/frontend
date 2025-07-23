import { pageTitle } from 'ember-page-title';
import Header from 'frontend/components/instructor-group/header';
import Users from 'frontend/components/instructor-group/users';
import CourseAssociations from 'frontend/components/instructor-group/course-associations';

<template>
  {{pageTitle " | " @instructorGroup.title prepend=false}}
  <div class="instructor-group-root" data-test-instructor-group-root ...attributes>
    <Header @instructorGroup={{@instructorGroup}} @canUpdate={{@canUpdate}} />
    <Users @canUpdate={{@canUpdate}} @instructorGroup={{@instructorGroup}} />
    <CourseAssociations
      @instructorGroup={{@instructorGroup}}
      @isExpanded={{@showCourseAssociations}}
      @setIsExpanded={{@setShowCourseAssociations}}
    />
  </div>
</template>
