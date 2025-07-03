import { pageTitle } from 'ember-page-title';
import Header from 'frontend/components/instructor-group/header';
import Users from 'frontend/components/instructor-group/users';
import Courses from 'frontend/components/instructor-group/courses';
<template>
  {{pageTitle " | " @instructorGroup.title prepend=false}}
  <div class="instructor-group-root" data-test-instructor-group-root ...attributes>
    <Header @instructorGroup={{@instructorGroup}} @canUpdate={{@canUpdate}} />
    <Users @canUpdate={{@canUpdate}} @instructorGroup={{@instructorGroup}} />
    <Courses @instructorGroup={{@instructorGroup}} />
  </div>
</template>
