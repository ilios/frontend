import MeshManager from 'ilios-common/components/mesh-manager';
<template>
  <div
    class="program-year-manage-objective-descriptors"
    data-test-program-year-manage-objective-descriptors
  >
    <MeshManager @add={{@add}} @remove={{@remove}} @terms={{@selected}} @editable={{@editable}} />
  </div>
</template>
