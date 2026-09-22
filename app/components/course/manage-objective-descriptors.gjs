import MeshManager from '../mesh-manager';
<template>
  <div class="course-manage-objective-descriptors" data-test-course-manage-objective-descriptors>
    <MeshManager @add={{@add}} @remove={{@remove}} @terms={{@selected}} @editable={{@editable}} />
  </div>
</template>
