import MeshManager from 'ilios-common/components/mesh-manager';
<template>
  <div class="session-manage-objective-descriptors" data-test-session-manage-objective-descriptors>
    <MeshManager @add={{@add}} @remove={{@remove}} @terms={{@selected}} @editable={{@editable}} />
  </div>
</template>
