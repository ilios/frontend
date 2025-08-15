import Overview from 'ilios-common/components/session/overview';
import SessionCopy from 'ilios-common/components/session-copy';
<template>
  <div class="session-details">
    <Overview
      @session={{@model}}
      @editable={{@controller.canUpdate}}
      @showCheckLink={{false}}
      @sessionTypes={{@model.sessionTypes}}
    />
    <SessionCopy @session={{@model}} @visit={{@controller.loadSession}} />
  </div>
</template>
